import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export function DropColumn({
  id,
  items,
  children,
}: {
  id: string;
  items: string[];
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <SortableContext
      id={id}
      items={items}
      strategy={verticalListSortingStrategy}
    >
      <div
        ref={setNodeRef}
        className="rounded-lg bg-white/[0.02] p-2 space-y-2 min-h-32"
      >
        {children}
      </div>
    </SortableContext>
  );
}
