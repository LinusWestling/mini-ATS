"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInterviews, useInterviewTemplates } from "@/src/hooks/use-interviews";
import { useRecruitmentProcesses } from "@/src/hooks/use-recruitment-processes";
import { toast } from "sonner";
import { Loader2, Save, Star, Plus, Trash2, Calculator } from "lucide-react";

interface InterviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: string;
  candidateName: string;
  companyId: string;
  jobTitle?: string;
}

export function InterviewModal({
  isOpen,
  onOpenChange,
  candidateId,
  candidateName,
  companyId,
  jobTitle
}: InterviewModalProps) {
  const { processes } = useRecruitmentProcesses(companyId);
  const { templates } = useInterviewTemplates(companyId);
  
  const [selectedProcessId, setSelectedProcessId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("none");
  const [title, setTitle] = useState(`Intervju med ${candidateName}`);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dynamic Questions State
  const [questions, setQuestions] = useState<{ text: string, score: number }[]>([
    { text: "Allmänt intryck", score: 0 }
  ]);

  const { createInterview, submitFeedback } = useInterviews(selectedProcessId || undefined);

  // Load questions from template
  useEffect(() => {
    if (selectedTemplateId && selectedTemplateId !== "none") {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template && Array.isArray(template.questions)) {
        setQuestions(template.questions.map((q: any) => ({
          text: typeof q === 'string' ? q : q.text,
          score: 0
        })));
      }
    }
  }, [selectedTemplateId, templates]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: "", score: 0 }]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    setQuestions(newQuestions);
  };

  const handleScoreChange = (index: number, score: number) => {
    const newQuestions = [...questions];
    newQuestions[index].score = score;
    setQuestions(newQuestions);
  };

  const meanScore = questions.length > 0 
    ? (questions.reduce((acc, q) => acc + q.score, 0) / questions.length).toFixed(1)
    : "0.0";

  const handleSubmit = async () => {
    if (!selectedProcessId) {
      toast.error("Välj en rekryteringsprocess att koppla intervjun till");
      return;
    }

    if (questions.some(q => !q.text.trim())) {
      toast.error("Alla frågor måste ha en text");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create the interview record
      const interview = await new Promise<any>((resolve, reject) => {
        createInterview({
          process_id: selectedProcessId,
          candidate_id: candidateId,
          title,
          notes,
          status: 'completed',
          template_id: selectedTemplateId === "none" ? null : selectedTemplateId,
          description: jobTitle || null
        }, {
          onSuccess: (data) => resolve(data),
          onError: (err) => reject(err)
        });
      });

      // 2. Submit all feedback/scores
      if (questions.length > 0) {
        const feedbackData = questions.map(q => ({
          interview_id: interview.id,
          question_text: q.text,
          score: q.score || 1, // Minimum score 1 for DB constraint if rated
          comment: ""
        }));

        await new Promise<void>((resolve, reject) => {
          submitFeedback(feedbackData, {
            onSuccess: () => resolve(),
            onError: (err) => reject(err)
          });
        });
      }

      toast.success("Intervju och bedömning sparad!");
      onOpenChange(false);
      // Reset state
      setNotes("");
      setQuestions([{ text: "Allmänt intryck", score: 0 }]);
      setSelectedTemplateId("none");
    } catch (err: any) {
      toast.error(err.message || "Kunde inte spara intervju");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            Genomför Intervju: {candidateName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Koppla till process *</Label>
                  <Select value={selectedProcessId} onValueChange={setSelectedProcessId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj process" />
                    </SelectTrigger>
                    <SelectContent>
                      {processes.length === 0 ? (
                        <SelectItem value="none" disabled>Inga aktiva processer</SelectItem>
                      ) : (
                        processes.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.role_name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Använd mall (frivilligt)</Label>
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj mall" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ingen mall</SelectItem>
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rubrik på intervju</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="T.ex. Första intervju" />
              </div>

              <div className="space-y-2">
                <Label>Allmänna anteckningar</Label>
                <Textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Skriv dina observationer här..." 
                  className="min-h-[150px]"
                />
              </div>
            </div>

            <Card className="bg-primary/5 border-primary/20 h-fit">
              <CardHeader className="p-4">
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Resultat</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-center">
                <div className="text-5xl font-black text-primary mb-2">{meanScore}</div>
                <p className="text-sm text-muted-foreground">Medelpoäng</p>
                <div className="mt-4 flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      className={`h-5 w-5 ${Number(meanScore) >= s ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Frågor & Bedömning
              </h3>
              <Button variant="outline" size="sm" onClick={handleAddQuestion}>
                <Plus className="h-4 w-4 mr-2" /> Lägg till fråga
              </Button>
            </div>

            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-border/50 bg-muted/20 items-start md:items-center group">
                  <div className="flex-1 w-full">
                    <Input 
                      value={q.text} 
                      onChange={(e) => handleQuestionChange(i, e.target.value)} 
                      placeholder="Fråga / Bedömningspunkt..."
                      className="bg-background"
                    />
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex bg-background rounded-lg border border-border/50 p-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleScoreChange(i, s)}
                          className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-colors ${
                            q.score === s 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted text-muted-foreground'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveQuestion(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-6">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Avbryt</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="px-8">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Slutför och spara intervju
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}