const Pane = ({ children }: { children: string }) => (
  <span
    className="flex h-4 items-center px-1.5 whitespace-nowrap
      shadow-(--bevel-thin-sunken)"
  >
    {children}
  </span>
);

const AquariusStatusBar = ({
  page,
  pages,
  inches,
  line,
  column,
}: {
  page: number;
  pages: number;
  inches: number;
  line: number;
  column: number;
}) => (
  <div
    role="status"
    aria-label="Document position"
    className="flex h-5 items-center gap-0.5 overflow-hidden px-0.5"
  >
    <Pane>{`Page ${page} of ${pages}`}</Pane>
    <span className="w-2" />
    <Pane>{`At ${inches.toFixed(1)}"`}</Pane>
    <Pane>{`Ln ${line}`}</Pane>
    <Pane>{`Col ${column}`}</Pane>
  </div>
);

export default AquariusStatusBar;
