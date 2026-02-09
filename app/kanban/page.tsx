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
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, GripHorizontal, ChevronLeft, ChevronRight, MessageSquare, User, Briefcase as BriefcaseIcon, Calendar } from "lucide-react";

import { Navbar } from "@/components/navbar";
import { useAdmin } from "@/src/providers/admin-provider";
import { useRecruitmentSteps } from "@/src/hooks/use-recruitment-steps";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InterviewModal } from "@/components/interview-modal";

function KanbanCard({ application, onClick }: { application: any; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: application.id,
    data: { type: 'Card', application }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="cursor-pointer hover:shadow-md transition-shadow group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
              {application.candidate?.name || "Okänd"}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {application.job?.title || "Okänt jobb"}
            </p>
          </div>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SortableKanbanColumn({ step, children }: { step: RecruitmentStep; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: step.id,
    data: { type: 'Column', step },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // We pass the attributes and listeners to the child component (KanbanColumn)
  // by cloning it or passing them as props.
  // Here we assume KanbanColumn accepts a dragHandleProps prop.
  return (
    <div ref={setNodeRef} style={style} className="flex-1 min-w-[280px] h-full">
      {children}
    </div>
  );
}

function KanbanColumn({
  status,
  applications,
  onCardClick,
  dragHandleProps,
}: {
  status: RecruitmentStep;
  applications: any[];
  onCardClick: (id: string) => void;
  dragHandleProps?: any;
}) {
  const statusApplications = applications.filter((app) => app.status === status.value);
  const { setNodeRef, isOver } = useDroppable({
    id: status.value,
    data: { type: 'ColumnDroppable', status },
  });

  return (
    <Card className="bg-muted/30 border-border/50 h-full flex flex-col">
      <CardHeader className="p-4 space-y-0">
        <div className="flex items-center gap-2 mb-4">
          <div 
            {...dragHandleProps} 
            className="cursor-grab active:cursor-grabbing hover:bg-muted p-1 rounded transition-colors"
          >
            <GripHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className={`w-3 h-3 rounded-full ${status.color}`} />
          <h3 className="font-semibold">{status.label}</h3>
          <Badge variant="secondary" className="ml-auto">
            {statusApplications.length}
          </Badge>
        </div>
      </CardHeader>
      <div className="px-4 pb-4 flex-1 flex flex-col">
        <SortableContext
          items={statusApplications.map((app) => app.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            ref={setNodeRef}
            className={`flex-1 space-y-2 min-h-[100px] p-2 rounded-md transition-colors ${
              isOver ? "bg-muted/50" : ""
            }`}
          >
            {statusApplications.map((application) => (
              <KanbanCard 
                key={application.id} 
                application={application} 
                onClick={() => onCardClick(application.id)}
              />
            ))}
            {statusApplications.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                Dra kandidater hit
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </Card>
  );
}

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
  const { steps, isLoading: stepsLoading, updateStepsOrder } = useRecruitmentSteps(effectiveCompanyId || undefined);

  const [jobFilter, setJobFilter] = useState<string>("all");
  const [candidateFilter, setCandidateFilter] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'Column' | 'Card' | null>(null);
  
  // Preview State
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

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

  const selectedApp = useMemo(() => 
    filteredApplications.find(app => app.id === selectedAppId),
  [filteredApplications, selectedAppId]);

  const navigatePreview = (direction: 'next' | 'prev') => {
    if (!selectedAppId) return;
    const currentIndex = filteredApplications.findIndex(app => app.id === selectedAppId);
    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % filteredApplications.length;
    } else {
      nextIndex = (currentIndex - 1 + filteredApplications.length) % filteredApplications.length;
    }
    setSelectedAppId(filteredApplications[nextIndex].id);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveType(event.active.data.current?.type);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    // Handle Column Reordering
    if (active.data.current?.type === 'Column') {
      if (active.id !== over.id) {
        const oldIndex = steps.findIndex((step) => step.id === active.id);
        const newIndex = steps.findIndex((step) => step.id === over.id);
        const newSteps = arrayMove(steps, oldIndex, newIndex);
        updateStepsOrder(newSteps);
      }
      return;
    }

    // Handle Card Moving
    const applicationId = active.id as string;
    // If dropped over a column (droppable) or another card
    let newStatus = over.id as string;
    
    // Check if we dropped on a column droppable
    if (over.data.current?.type === 'ColumnDroppable') {
       newStatus = (over.data.current.status as RecruitmentStep).value;
    } 
    // If dropped on another card, find the column/status of that card
    else if (over.data.current?.type === 'Card') {
       // We can't easily get status from the card id alone without looking it up, 
       // but typically dnd-kit sortable context helps.
       // However, since we have multiple sortable contexts (columns), 
       // finding the container id is easier. 
       // But 'over.id' is the card ID.
       const overApp = applications.find(a => a.id === over.id);
       if (overApp) {
         newStatus = overApp.status;
       }
    }

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
            <SortableContext 
              items={steps.map(s => s.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6">
                {steps.map((step) => (
                  <SortableKanbanColumn key={step.id} step={step}>
                     {/* We need to pass the drag listeners to the KanbanColumn */}
                     {/* Since SortableKanbanColumn wraps it, we can use a render prop or just pass props if we were inside */}
                     {/* Actually, SortableKanbanColumn 'uses' useSortable. */}
                     {/* We need to pass attributes and listeners from SortableKanbanColumn down to KanbanColumn */}
                     {/* The cleaner way is to let SortableKanbanColumn handle the wrapping div, but pass the handle props to children */}
                     {/* Let's refactor SortableKanbanColumn to clone children with props or accept a render prop. */}
                     {/* Simpler: just inline the logic or pass props. */}
                     <KanbanColumnWrapper step={step} filteredApplications={filteredApplications} setSelectedAppId={setSelectedAppId} />
                  </SortableKanbanColumn>
                ))}
              </div>
            </SortableContext>
            
            <DragOverlay>
              {activeId ? (
                activeType === 'Column' ? (
                   <Card className="w-[280px] h-[400px] border-primary shadow-lg bg-background opacity-80">
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-2">
                           <GripHorizontal className="h-4 w-4 text-muted-foreground" />
                           <h3 className="font-semibold">{steps.find(s => s.id === activeId)?.label}</h3>
                        </div>
                      </CardHeader>
                   </Card>
                ) : (
                  <Card className="w-64 border-primary shadow-lg cursor-grabbing">
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
                )
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        <Dialog open={!!selectedAppId} onOpenChange={(open) => !open && setSelectedAppId(null)}>
          <DialogContent className="max-w-2xl">
            {selectedApp && (
              <>
                <DialogHeader className="flex flex-row items-center justify-between pr-8">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl">{selectedApp.candidate?.name}</DialogTitle>
                      <DialogDescription className="flex items-center gap-2">
                        <BriefcaseIcon className="h-3 w-3" />
                        {selectedApp.job?.title}
                      </DialogDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigatePreview('prev')}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => navigatePreview('next')}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aktuell status</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge>{steps.find(s => s.value === selectedApp.status)?.label || selectedApp.status}</Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kontakt</Label>
                      <div className="mt-1 space-y-1 text-sm">
                        <p>{selectedApp.candidate?.email}</p>
                        <p>{selectedApp.candidate?.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Snabba åtgärder</Label>
                      <div className="mt-1 flex flex-col gap-2">
                        <Button className="w-full justify-start" onClick={() => router.push(`/candidates/${selectedApp.candidate_id}`)}>
                          <User className="mr-2 h-4 w-4" /> Visa fullständig profil
                        </Button>
                        <Button variant="secondary" className="w-full justify-start" onClick={() => setIsInterviewModalOpen(true)}>
                          <MessageSquare className="mr-2 h-4 w-4" /> Starta intervju
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {selectedApp && (
          <InterviewModal 
            isOpen={isInterviewModalOpen}
            onOpenChange={setIsInterviewModalOpen}
            candidateId={selectedApp.candidate_id}
            candidateName={selectedApp.candidate?.name || "Kandidat"}
            companyId={effectiveCompanyId || ""}
            jobTitle={selectedApp.job?.title}
          />
        )}
      </div>
    </div>
  );
}

// Helper component to avoid Prop Drilling hell or cloning complexity
function KanbanColumnWrapper({ 
  step, 
  filteredApplications, 
  setSelectedAppId 
}: { 
  step: RecruitmentStep, 
  filteredApplications: any[], 
  setSelectedAppId: (id: string) => void 
}) {
  const {
    attributes,
    listeners,
  } = useSortable({
    id: step.id,
    data: { type: 'Column', step },
  });

  return (
    <KanbanColumn 
       status={step} 
       applications={filteredApplications} 
       onCardClick={setSelectedAppId} 
       dragHandleProps={{ ...attributes, ...listeners }} 
    />
  );
}
