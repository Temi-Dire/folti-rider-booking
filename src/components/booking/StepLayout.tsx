import type { ReactNode } from "react";

/** Header, scrollable body and a sticky footer for the main action. */
export function StepLayout({ header, footer, children }: { header?: ReactNode; footer?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col animate-sheet-in">
      {header}
      <div className="no-scrollbar -mx-4 min-h-0 flex-1 overflow-y-auto px-4 pb-2">{children}</div>
      {footer && <div className="space-y-2 pt-3">{footer}</div>}
    </div>
  );
}
