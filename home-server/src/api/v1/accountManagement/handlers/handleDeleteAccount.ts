import { DeleteAccountResponse, EncodedAccountJwt } from "@home/shared";
import { NotificationModel } from "../../model/notificationModel";
import { UserModel } from "../../model/userModel";
import { ApiMessage } from "../../http/messages";

export const handleDeleteAccount = async (
  decodedToken: EncodedAccountJwt,
): Promise<DeleteAccountResponse> => {
  const userId = decodedToken.user._id;

  const foundUser = await UserModel.findById(userId);

  if (!foundUser) {
    return { error: true, message: ApiMessage.UNEXPECTED };
  }

  await NotificationModel.deleteMany({ recipientUserId: foundUser._id });
  await UserModel.findByIdAndDelete(foundUser._id);

  return { error: false, message: ApiMessage.ACCOUNT_DELETED };
};
