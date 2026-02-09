"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/src/hooks/use-auth";
import { useAdmin } from "@/src/providers/admin-provider";
import { useRecruitmentProcesses } from "@/src/hooks/use-recruitment-processes";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, Plus, CheckCircle2, Sparkles, FileText, Upload, Save, User, Star, Trash2, Pencil } from "lucide-react";

import { useInterviews } from "@/src/hooks/use-interviews";
import { useCandidates } from "@/src/hooks/use-candidates";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function EditRecruitmentPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const params = useParams();
  const processId = params.id as string;
  
  const { profile } = useAuth();
  const { selectedCompanyId } = useAdmin();
  const effectiveCompanyId = profile?.role === "admin" ? selectedCompanyId : profile?.company_id;
  
  const { departments, createDepartment, createProcess, updateProcess, processes } = useRecruitmentProcesses(effectiveCompanyId || undefined);
  const { candidates } = useCandidates(effectiveCompanyId || undefined);
  const { interviews, isLoading: interviewsLoading } = useInterviews(processId);

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProcess, setIsLoadingProcess] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [viewMode, setViewMode] = useState<"wizard" | "summary">("summary");
  
  // Form State
  const [roleName, setRoleName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [description, setDescription] = useState("");
  
  // File State
  const [roleDoc, setRoleDoc] = useState<File | null>(null);
  const [notesDoc, setNotesDoc] = useState<File | null>(null);
  
  // Page 2 State
  const [meetingNotes, setMeetingNotes] = useState("");
  const [jobAd, setJobAd] = useState("");

  // Page 5 State (Interview Planning)
  const [plannedInterviews, setPlannedInterviews] = useState<{title: string, desc: string}[]>([]);
  const [showAddInterview, setShowAddInterview] = useState(false);
  const [newIntTitle, setNewIntTitle] = useState("");
  const [newIntDesc, setNewIntDesc] = useState("");

  // Edit Interview Modal State
  const [isEditInterviewDialogOpen, setIsEditInterviewDialogOpen] = useState(false);
  const [editingInterviewIndex, setEditingInterviewIndex] = useState<number | null>(null);
  const [editIntTitle, setEditIntTitle] = useState("");
  const [editIntDesc, setEditIntDesc] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (processes.length > 0 && processId && !isInitialized) {
      const process = processes.find(p => p.id === processId);
      if (process) {
        setRoleName(process.role_name);
        setDepartmentId(process.department_id || "");
        setDescription(process.description || "");
        
        const kp = process.kravprofil || {};
        setMeetingNotes(kp.meeting_notes || "");
        setJobAd(kp.job_ad || "");
        setPlannedInterviews(kp.planned_interviews || []);
        
        if (process.status === 'draft') {
          setViewMode("wizard");
        }
        
        setIsInitialized(true);
        setIsLoadingProcess(false);
      }
    }
  }, [processes, processId, isInitialized]);

  const handleAddInterview = () => {
    if (!newIntTitle) return;
    setPlannedInterviews([...plannedInterviews, { title: newIntTitle, desc: newIntDesc }]);
    setNewIntTitle("");
    setNewIntDesc("");
    setShowAddInterview(false);
  };

  // --- Summary Edit Handlers ---

  const handleOpenAddInterviewDialog = () => {
    setEditingInterviewIndex(null);
    setEditIntTitle("");
    setEditIntDesc("");
    setIsEditInterviewDialogOpen(true);
  };

  const handleOpenEditInterviewDialog = (index: number) => {
    setEditingInterviewIndex(index);
    setEditIntTitle(plannedInterviews[index].title);
    setEditIntDesc(plannedInterviews[index].desc);
    setIsEditInterviewDialogOpen(true);
  };

  const handleSaveInterviewStep = async () => {
    if (!editIntTitle) {
      toast.error("Titel krävs");
      return;
    }

    const newInterviews = [...plannedInterviews];
    if (editingInterviewIndex !== null) {
      newInterviews[editingInterviewIndex] = { title: editIntTitle, desc: editIntDesc };
    } else {
      newInterviews.push({ title: editIntTitle, desc: editIntDesc });
    }

    // Optimistic update
    setPlannedInterviews(newInterviews);
    setIsEditInterviewDialogOpen(false);

    // Persist
    try {
      await new Promise<void>((resolve, reject) => {
        updateProcess({
          id: processId,
          kravprofil: {
            meeting_notes: meetingNotes,
            job_ad: jobAd,
            planned_interviews: newInterviews
          }
        }, {
          onSuccess: () => resolve(),
          onError: (err) => reject(err)
        });
      });
      toast.success(editingInterviewIndex !== null ? "Intervjusteg uppdaterat" : "Intervjusteg tillagt");
    } catch (err) {
      toast.error("Kunde inte spara ändringen");
    }
  };

  const handleDeleteInterviewStep = async (index: number) => {
    if (!confirm("Vill du ta bort detta steg?")) return;
    
    const newInterviews = plannedInterviews.filter((_, i) => i !== index);
    setPlannedInterviews(newInterviews);
    
    try {
      await new Promise<void>((resolve, reject) => {
        updateProcess({
          id: processId,
          kravprofil: {
            meeting_notes: meetingNotes,
            job_ad: jobAd,
            planned_interviews: newInterviews
          }
        }, {
          onSuccess: () => resolve(),
          onError: (err) => reject(err)
        });
      });
      toast.success("Intervjusteg borttaget");
    } catch (err) {
      toast.error("Kunde inte ta bort steg");
    }
  };

  // -----------------------------

  const handleUpdate = async () => {
    if (!effectiveCompanyId) return;
    setIsSubmitting(true);
    try {
      let finalDeptId = departmentId;
      if (departmentId === "new" && newDeptName) {
        const dept = await new Promise<any>((resolve, reject) => {
          createDepartment(newDeptName, {
            onSuccess: (data) => resolve(data),
            onError: (err) => reject(err)
          });
        });
        finalDeptId = dept.id;
      }

      updateProcess({
        id: processId,
        department_id: finalDeptId || null,
        role_name: roleName,
        description,
        kravprofil: {
          meeting_notes: meetingNotes,
          job_ad: jobAd,
          planned_interviews: plannedInterviews
        }
      }, {
        onSuccess: () => {
          if (viewMode === "wizard") {
            setStep((s) => (s + 1) as Step);
          }
          toast.success("Process uppdaterad!");
        },
        onError: (err: any) => {
          console.error("Update process error:", err);
          toast.error(err.message || "Kunde inte uppdatera process");
        }
      });
    } catch (err: any) {
      toast.error(err.message || "Ett oväntat fel uppstod");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = async () => {
    setIsSubmitting(true);
    try {
      await new Promise<void>((resolve, reject) => {
        updateProcess({
          id: processId,
          kravprofil: {
            meeting_notes: meetingNotes,
            job_ad: jobAd,
            planned_interviews: plannedInterviews
          }
        }, {
          onSuccess: () => resolve(),
          onError: (err) => reject(err)
        });
      });
      setStep((s) => (s + 1) as Step);
    } catch (err: any) {
      toast.error(err.message || "Kunde inte spara steg");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishJob = () => {
    // Navigate to job creation with params
    const params = new URLSearchParams({
      title: roleName,
      description: jobAd || description
    });
    router.push(`/jobs/new?${params.toString()}`);
  };

  const handleFinish = async () => {
    if (!processId) return;
    setIsSubmitting(true);
    try {
      updateProcess({
        id: processId,
        status: 'active',
        kravprofil: {
          meeting_notes: meetingNotes,
          job_ad: jobAd,
          planned_interviews: plannedInterviews
        }
      }, {
        onSuccess: () => {
          toast.success("Rekryteringsprocess sparad!");
          setViewMode("summary");
        },
        onError: (err: any) => toast.error(err.message)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIGenerate = () => {
    toast.error("Sorry but the AI-functionality is currently not working");
  };

  const calculateMeanScore = (feedback: any[]) => {
    if (!feedback || feedback.length === 0) return 0;
    const sum = feedback.reduce((acc, f) => acc + f.score, 0);
    return (sum / feedback.length).toFixed(1);
  };

  const renderSummary = () => {
    const deptName = departments.find(d => d.id === departmentId)?.name || "Okänd avdelning";
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Övergripande information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Roll / Befattning</Label>
                <p className="text-xl font-semibold">{roleName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Avdelning</Label>
                <p className="font-medium">{deptName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Rollbeskrivning</Label>
                <p className="whitespace-pre-wrap mt-1">{description || "Ingen beskrivning"}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <p className="font-bold text-lg">Aktiv Process</p>
              <p className="text-sm text-muted-foreground mt-1 text-center">
                Processen är konfigurerad och klar för användning.
              </p>
              <Button className="w-full mt-6" onClick={handlePublishJob}>
                Publicera jobbannons
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Interviews Section */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Genomförda intervjuer</CardTitle>
            <CardDescription>Sammanställning av kandidatbetyg för denna process</CardDescription>
          </CardHeader>
          <CardContent>
            {interviewsLoading ? (
              <div className="text-center py-8">Laddar intervjuer...</div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                Inga intervjuer genomförda i denna process ännu.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kandidat</TableHead>
                    <TableHead>Intervju</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead className="text-center">Medelbetyg</TableHead>
                    <TableHead className="text-right">Åtgärd</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews.map((interview: any) => (
                    <TableRow key={interview.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {interview.candidate?.name}
                        </div>
                      </TableCell>
                      <TableCell>{interview.title}</TableCell>
                      <TableCell>{new Date(interview.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-bold">
                          <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
                          {calculateMeanScore(interview.feedback)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/candidates/${interview.candidate_id}`)}>
                          Visa profil
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mötesanteckningar</CardTitle>
              <CardDescription>Summering från uppstartsmötet</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm italic border-l-4 border-primary/20 pl-4 py-2 bg-muted/20 rounded-r">
                {meetingNotes || "Inga anteckningar sparade."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jobbannons</CardTitle>
              <CardDescription>Det aktuella utkastet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[200px] overflow-y-auto pr-2 text-sm">
                <p className="whitespace-pre-wrap">{jobAd || "Ingen annons sparad."}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Planerade intervjusteg</CardTitle>
                <CardDescription>Struktur för utvärdering</CardDescription>
              </div>
              <Button size="sm" onClick={handleOpenAddInterviewDialog}>
                <Plus className="mr-2 h-4 w-4" /> Lägg till steg
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plannedInterviews.length === 0 ? (
                <p className="text-muted-foreground col-span-full text-center py-8 border-2 border-dashed rounded-xl">
                  Inga intervjusteg planerade.
                </p>
              ) : (
                plannedInterviews.map((int, i) => (
                  <div 
                    key={i} 
                    className="p-4 rounded-xl border border-border/50 bg-background relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => handleOpenEditInterviewDialog(i)}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold pr-6">{int.title}</h4>
                      <Button
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-destructive -mt-1 -mr-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteInterviewStep(i);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{int.desc}</p>
                    <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Steg {i+1}</span>
                      <Pencil className="h-3 w-3 text-muted-foreground opacity-50 group-hover:opacity-100" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={isEditInterviewDialogOpen} onOpenChange={setIsEditInterviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingInterviewIndex !== null ? "Redigera intervjusteg" : "Lägg till intervjusteg"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Namn på steg</Label>
                <Input value={editIntTitle} onChange={(e) => setEditIntTitle(e.target.value)} placeholder="T.ex. Teknisk intervju" />
              </div>
              <div className="space-y-2">
                <Label>Beskrivning</Label>
                <Textarea value={editIntDesc} onChange={(e) => setEditIntDesc(e.target.value)} placeholder="Beskriv vad som ska ske i detta steg..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsEditInterviewDialogOpen(false)}>Avbryt</Button>
              <Button onClick={handleSaveInterviewStep}>Spara</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Avdelning</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj avdelning" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                    <SelectItem value="new">+ Lägg till ny</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Roll / Befattning</Label>
                <Input value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="T.ex. Senior Frontendutvecklare" />
              </div>
            </div>

            {departmentId === "new" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label>Namn på ny avdelning</Label>
                <Input value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="T.ex. Marknad" />
              </div>
            )}

            <div className="space-y-2">
              <Label>Ladda upp rollbeskrivning / liknande roller</Label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 border-border/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {roleDoc ? (
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <FileText className="h-5 w-5" />
                        {roleDoc.name}
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Klicka för att ladda upp dokument</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" onChange={(e) => setRoleDoc(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Eller skriv in beskrivning manuellt</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Beskriv rollen, krav och förväntningar..." 
                className="min-h-[150px]"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Ladda upp transkriberade mötesanteckningar</Label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 border-border/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {notesDoc ? (
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <FileText className="h-5 w-5" />
                        {notesDoc.name}
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Klicka för att ladda upp mötesanteckningar</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" onChange={(e) => setNotesDoc(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Summering från uppstartsmöte (manuellt)</Label>
              <Textarea 
                value={meetingNotes} 
                onChange={(e) => setMeetingNotes(e.target.value)} 
                placeholder="Viktiga punkter från mötet..." 
                className="min-h-[150px]"
              />
            </div>
            
            <div className="p-6 border-2 border-dashed rounded-xl bg-primary/5 border-primary/20 flex flex-col items-center justify-center text-center space-y-4">
              <Sparkles className="h-10 w-10 text-primary animate-pulse" />
              <div>
                <h3 className="text-lg font-semibold">Generera Kravprofil</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  AI analyserar dokument och anteckningar för att skapa en komplett kravprofil.
                </p>
              </div>
              <Button onClick={handleAIGenerate} variant="default" className="bg-primary hover:bg-primary/90">
                <Sparkles className="mr-2 h-4 w-4" />
                Generera med AI
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" /> Överblick: Kravprofil
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Baserat på {roleName} inom {departments.find(d => d.id === departmentId)?.name || 'avdelningen'}.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Jobbannons (utkast)</Label>
              <Textarea 
                value={jobAd} 
                onChange={(e) => setJobAd(e.target.value)} 
                placeholder="Här visas den genererade annonsen..." 
                className="min-h-[300px]"
              />
            </div>
            <div className="p-6 border-2 border-dashed rounded-xl bg-muted/30 flex flex-col items-center justify-center text-center space-y-4">
              <Sparkles className="h-10 w-10 text-primary animate-pulse" />
              <div>
                <h3 className="text-lg font-semibold">Generera Annons</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  AI skapar en säljande jobbannons baserat på din kravprofil och era befintliga mallar.
                </p>
              </div>
              <Button onClick={handleAIGenerate} variant="secondary">
                <Sparkles className="mr-2 h-4 w-4" />
                Skapa annons med AI
              </Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 py-10 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-2xl font-bold">Klar att publicera!</h2>
              <p className="text-muted-foreground">
                Din rekryteringsprocess är nu uppsatt och annonsen är klar. Du kan nu publicera jobbet för att börja ta emot ansökningar.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={handlePublishJob}>
                Publicera jobb nu
              </Button>
              <Button size="lg" variant="outline" onClick={() => setStep(5)}>
                Planera intervjuer först
              </Button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Intervjusteg</h3>
              <Button size="sm" onClick={() => setShowAddInterview(true)}>
                <Plus className="mr-2 h-4 w-4" /> Lägg till steg
              </Button>
            </div>

            <div className="grid gap-4">
              {plannedInterviews.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-xl text-muted-foreground">
                  Inga intervjusteg planerade ännu.
                </div>
              ) : (
                plannedInterviews.map((int, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border/50 bg-muted/20 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{int.title}</h4>
                      <p className="text-sm text-muted-foreground">{int.desc}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={handleAIGenerate}>
                        <Sparkles className="mr-2 h-4 w-4" /> Föreslå frågor
                      </Button>
                      <Button variant="outline" size="sm">Redigera mall</Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {showAddInterview && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-base">Nytt intervjusteg</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Namn på steg</Label>
                    <Input value={newIntTitle} onChange={(e) => setNewIntTitle(e.target.value)} placeholder="T.ex. Teknisk intervju 1" />
                  </div>
                  <div className="space-y-2">
                    <Label>Beskrivning / Syfte</Label>
                    <Textarea value={newIntDesc} onChange={(e) => setNewIntDesc(e.target.value)} placeholder="T.ex. 60 min teknisk genomgång..." />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setShowAddInterview(false)}>Avbryt</Button>
                  <Button onClick={handleAddInterview}>Spara steg</Button>
                </CardFooter>
              </Card>
            )}
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Kandidatjämförelse</h3>
                <p className="text-sm text-muted-foreground">Jämför intervjuresultat och betyg.</p>
              </div>
              <Button variant="outline" onClick={handleAIGenerate}>
                <Sparkles className="mr-2 h-4 w-4" /> AI-Analys
              </Button>
            </div>

            <div className="rounded-xl border border-border/50 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Kandidat</th>
                    <th className="text-center p-4 font-semibold">Intervju 1</th>
                    <th className="text-center p-4 font-semibold">Intervju 2</th>
                    <th className="text-center p-4 font-semibold">Totalpoäng</th>
                    <th className="text-right p-4 font-semibold">Åtgärd</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {candidates.slice(0, 3).map((c, i) => (
                    <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium">{c.name}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-yellow-500/10 text-yellow-600 font-bold">
                          {4 + (i % 2)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-500/10 text-green-600 font-bold">
                          {3 + (i % 3)}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold">
                        {(7 + (i % 2) + (i % 3))} / 10
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm">Visa detaljer</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 rounded-xl border border-dashed bg-muted/30 text-center">
              <p className="text-muted-foreground italic">
                "Här kommer AI att kunna sammanställa för- och nackdelar för varje kandidat baserat på intervjuanteckningar."
              </p>
            </div>
          </div>
        );
      default:
        return <div className="py-20 text-center text-muted-foreground">Slut på steg.</div>;
    }
  };

  if (!mounted) return null;

  if (isLoadingProcess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {viewMode === "summary" ? "Sammanfattning" : "Hantera rekryteringsprocess"}
            </h1>
            <p className="text-muted-foreground">
              {viewMode === "summary" 
                ? `Här är en överblick av din rekrytering för ${roleName}`
                : `Redigera och fortsätt din rekrytering för ${roleName}`
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setViewMode(viewMode === "summary" ? "wizard" : "summary")}
            >
              {viewMode === "summary" ? "Redigera Process" : "Visa Sammanfattning"}
            </Button>
            {viewMode === "wizard" && (
              <div className="flex items-center gap-2 ml-4">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <div 
                    key={s} 
                    className={`h-2 w-8 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {viewMode === "summary" ? renderSummary() : (
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Steg {step}: {
                step === 1 ? "Initiering" : 
                step === 2 ? "Kravprofil" : 
                step === 3 ? "Jobbannons" : 
                step === 4 ? "Publicering" : 
                step === 5 ? "Intervjuplanering" : "Sammanfattning"
              }</CardTitle>
              <CardDescription>
                Hantera steg {step} i processen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderStep()}
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button 
                variant="ghost" 
                onClick={() => step > 1 && setStep((s) => (s - 1) as Step)}
                disabled={step === 1 || isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Tillbaka
              </Button>
              
              {step === 1 ? (
                <Button onClick={handleUpdate} disabled={!roleName || isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Spara & Nästa
                </Button>
              ) : step === 6 ? (
                <Button onClick={handleFinish} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Slutför och spara
                </Button>
              ) : (
                <Button onClick={handleNextStep} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Nästa steg"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
