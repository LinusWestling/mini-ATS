"use client";

import { useState } from "react";
import { useRecruitmentSteps } from "@/src/hooks/use-recruitment-steps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface RecruitmentStepsProps {
  companyId: string;
}

function SortableStep({ step, onDelete }: { step: any; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-card border rounded-md"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className={`w-3 h-3 rounded-full ${step.color}`} />
      <span className="flex-1 font-medium">{step.label}</span>
      {!step.is_system && (
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(step.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export function RecruitmentSteps({ companyId }: RecruitmentStepsProps) {
  const { steps, isLoading, createStep, deleteStep, updateStepsOrder } = useRecruitmentSteps(companyId);
  const [newLabel, setNewLabel] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = steps.findIndex((step) => step.id === active.id);
      const newIndex = steps.findIndex((step) => step.id === over?.id);
      
      const newSteps = arrayMove(steps, oldIndex, newIndex);
      updateStepsOrder(newSteps);
    }
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    setIsCreating(true);
    try {
      const value = newLabel.toLowerCase().replace(/\s+/g, "_");
      createStep(
        {
          company_id: companyId,
          label: newLabel,
          value,
          order: steps.length,
          color: "bg-gray-500", // Default color
        },
        {
          onSuccess: () => {
            setNewLabel("");
            toast.success("Steg tillagt!");
          },
          onError: () => toast.error("Kunde inte lägga till steg."),
        }
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Är du säker? Kandidater i detta steg kan förlora sin status.")) {
      deleteStep(id, {
        onSuccess: () => toast.success("Steg borttaget!"),
        onError: () => toast.error("Kunde inte ta bort steg."),
      });
    }
  };

  if (isLoading) return <div>Laddar...</div>;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle>Rekryteringsprocess</CardTitle>
        <CardDescription>Anpassa stegen i din Kanban-tavla</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={steps.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {steps.map((step) => (
                <SortableStep key={step.id} step={step} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <form onSubmit={handleAddStep} className="flex gap-2">
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Namn på nytt steg..."
            disabled={isCreating}
          />
          <Button type="submit" disabled={isCreating || !newLabel.trim()}>
            {isCreating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            Lägg till
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
