"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/src/hooks/use-auth";
import { useApplications } from "@/src/hooks/use-applications";
import { useJobs } from "@/src/hooks/use-jobs";
import { useCandidates } from "@/src/hooks/use-candidates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ApplicationStatus, RecruitmentStep } from "@/src/lib/types/database";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

function KanbanCard({ application }: { application: any }) {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => router.push(`/candidates/${application.candidate_id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{application.candidate?.name || "Okänd"}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {application.job?.title || "Okänt jobb"}
            </p>
          </div>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanColumn({
  status,
  applications,
}: {
  status: RecruitmentStep;
  applications: any[];
}) {
  const statusApplications = applications.filter((app) => app.status === status.value);
  const { setNodeRef, isOver } = useDroppable({
    id: status.value,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${status.color}`} />
        <h3 className="font-semibold">{status.label}</h3>
        <Badge variant="secondary" className="ml-auto">
          {statusApplications.length}
        </Badge>
      </div>
      <SortableContext
        items={statusApplications.map((app) => app.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`flex-1 space-y-2 min-h-[200px] p-2 rounded-md transition-colors ${
            isOver ? "bg-muted/50" : ""
          }`}
        >
          {statusApplications.map((application) => (
            <KanbanCard key={application.id} application={application} />
          ))}
          {statusApplications.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">
              Dra kandidater hit
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

import { Navbar } from "@/components/navbar";
import { useAdmin } from "@/src/providers/admin-provider";
import { useRecruitmentSteps } from "@/src/hooks/use-recruitment-steps";

export default function KanbanPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const { selectedCompanyId } = useAdmin();
  const router = useRouter();

  const effectiveCompanyId = profile?.role === "admin" ? selectedCompanyId : profile?.company_id;

  const { applications, isLoading: appsLoading, updateStatus } = useApplications(
    undefined,
    effectiveCompanyId || undefined
  );
  const { jobs } = useJobs(effectiveCompanyId || undefined);
  const { steps, isLoading: stepsLoading } = useRecruitmentSteps(effectiveCompanyId || undefined);

  const [jobFilter, setJobFilter] = useState<string>("all");
  const [candidateFilter, setCandidateFilter] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredApplications = useMemo(() => {
    let filtered = applications;

    if (jobFilter !== "all") {
      filtered = filtered.filter((app) => app.job_id === jobFilter);
    }

    if (candidateFilter) {
      filtered = filtered.filter((app) =>
        app.candidate?.name?.toLowerCase().includes(candidateFilter.toLowerCase())
      );
    }

    return filtered;
  }, [applications, jobFilter, candidateFilter]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const applicationId = active.id as string;
    const newStatus = over.id as ApplicationStatus;

    const application = applications.find((app) => app.id === applicationId);
    if (application && application.status !== newStatus) {
      updateStatus(
        { id: applicationId, status: newStatus },
        {
          onSuccess: () => {
            toast.success("Status uppdaterad!");
          },
          onError: (error: any) => {
            toast.error(error.message || "Kunde inte uppdatera status");
          },
        }
      );
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Laddar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight">Kanban</h1>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Filtrera kandidater</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label className="mb-2 block">Jobb</Label>
                <Select value={jobFilter} onValueChange={setJobFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alla jobb</SelectItem>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="mb-2 block">Kandidatnamn</Label>
                <Input
                  placeholder="Sök efter kandidat..."
                  value={candidateFilter}
                  onChange={(e) => setCandidateFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {appsLoading || stepsLoading ? (
          <div className="text-center py-20">Laddar kanban...</div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6">
              {steps.map((step) => (
                <div key={step.value} className="flex-1 min-w-[280px]">
                  <Card className="bg-muted/30 border-border/50 h-full">
                    <CardHeader className="p-4">
                      <KanbanColumn status={step} applications={filteredApplications} />
                    </CardHeader>
                  </Card>
                </div>
              ))}
            </div>
            <DragOverlay>
              {activeId ? (
                <Card className="w-64 border-primary shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold text-sm">
                          {applications.find((app) => app.id === activeId)?.candidate?.name ||
                            "Okänd"}
                        </h4>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}
