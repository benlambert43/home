import { discardPostUpload, startPostUpload } from "@/app/actions/postUploads";
import {
  allPendingImages,
  PendingPostImages,
} from "@/app/blog/postForm/pendingPostImages";
import {
  PostImageUploads,
  uploadPostImages,
  uploadSessionLost,
} from "@/app/blog/postForm/uploadPostImages";
import { SERVICE_UNAVAILABLE_MESSAGE } from "@/app/lib/messages";
import { useEffect, useRef, useState } from "react";

const UPLOAD_FAILED_MESSAGE =
  "Some images could not be uploaded. Please try again.";

type PostUploadSession = {
  uploadId: string;
  images: PendingPostImages;
  uploaded: string[];
};

type Refused = { ok: false; message: string };

type StartedUpload = { ok: true; session: PostUploadSession } | Refused;

export type PostImageUploadResult = { ok: true; uploadId: string } | Refused;

const failedUploads = (uploads: PostImageUploads) =>
  Object.fromEntries(
    Object.entries(uploads).flatMap(([name, { response }]) =>
      response.error ? [[name, response.message]] : [],
    ),
  );

const uploadedNames = (uploads: PostImageUploads) =>
  Object.entries(uploads).flatMap(([name, { response }]) =>
    response.error ? [] : [name],
  );

const uploadedProgress = (names: string[]) =>
  Object.fromEntries(names.map((name) => [name, 1]));

const discardSession = (session: PostUploadSession | undefined) => {
  if (session) void discardPostUpload(session.uploadId);
};

export const usePostImageUpload = () => {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const sessionRef = useRef<PostUploadSession>(undefined);

  useEffect(
    () => () => {
      discardSession(sessionRef.current);
      sessionRef.current = undefined;
    },
    [],
  );

  const resumeOrStartSession = async (
    images: PendingPostImages,
  ): Promise<StartedUpload> => {
    const resumed = sessionRef.current;

    if (resumed?.images === images) return { ok: true, session: resumed };

    discardSession(resumed);
    sessionRef.current = undefined;

    const started = await startPostUpload({
      headerImage: images.headerImage?.name,
      inlineImages: images.inlineImages.map((image) => image.name),
    });

    if (started.error) return { ok: false, message: started.message };

    const session: PostUploadSession = {
      uploadId: started.uploadId,
      images,
      uploaded: [],
    };

    sessionRef.current = session;

    return { ok: true, session };
  };

  const uploadSession = async (
    session: PostUploadSession,
  ): Promise<PostImageUploadResult> => {
    setProgress(uploadedProgress(session.uploaded));

    const uploads = await uploadPostImages(
      session.uploadId,
      allPendingImages(session.images).filter(
        (image) => !session.uploaded.includes(image.name),
      ),
      (name, fraction) => {
        setProgress((current) => ({ ...current, [name]: fraction }));
      },
    );

    sessionRef.current = uploadSessionLost(uploads)
      ? undefined
      : {
          ...session,
          uploaded: [...session.uploaded, ...uploadedNames(uploads)],
        };

    const failed = failedUploads(uploads);

    if (Object.keys(failed).length === 0) {
      return { ok: true, uploadId: session.uploadId };
    }

    setErrors(failed);

    return { ok: false, message: UPLOAD_FAILED_MESSAGE };
  };

  const upload = async (
    images: PendingPostImages,
  ): Promise<PostImageUploadResult> => {
    setErrors({});
    setUploading(true);

    try {
      const started = await resumeOrStartSession(images);

      return started.ok ? await uploadSession(started.session) : started;
    } catch (e) {
      console.error("Post images could not be uploaded:", e);
      return { ok: false, message: SERVICE_UNAVAILABLE_MESSAGE };
    } finally {
      setUploading(false);
    }
  };

  return { upload, progress, errors, uploading };
};
