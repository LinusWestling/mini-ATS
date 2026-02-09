app/api/candidates/route.ts
Comment on lines +4 to +22
export async function GET(request: NextRequest) {
const supabase = await createClient();
const searchParams = request.nextUrl.searchParams;
const companyId = searchParams.get("companyId");

let query = supabase.from("candidates").select("*").order("created_at", { ascending: false });

if (companyId) {
query = query.eq("company_id", companyId);
}

const { data, error } = await query;

if (error) {
return NextResponse.json({ error: error.message }, { status: 500 });
}

return NextResponse.json(data);
}
@coderabbitai
coderabbitai bot
1 hour ago
⚠️ Potential issue | 🔴 Critical

GET without companyId returns all candidates across all tenants.

When companyId is not supplied, the query fetches every candidate in the table with no tenant scoping. Unless Supabase RLS strictly limits rows to the caller's company, this is a cross-tenant data leak exposing PII. Consider making companyId mandatory or deriving it from the authenticated user's session.


app/api/companies/[id]/route.ts
Comment on lines +4 to +21
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
const { id } = await params;
const supabase = await createClient();
const body = await request.json();

const { data, error } = await supabase
.from("companies")
.update(body)
.eq("id", id)
.select()
.single();

if (error) {
return NextResponse.json({ error: error.message }, { status: 500 });
}

return NextResponse.json(data);
}
@coderabbitai
coderabbitai bot
1 hour ago
⚠️ Potential issue | 🔴 Critical

No authentication or authorization, and raw body is passed directly to the database update.

Two security concerns:

Missing auth check: There's no supabase.auth.getUser() verification (unlike app/api/auth/me/route.ts which does check). If Supabase RLS isn't properly configured, any unauthenticated caller can mutate any company record. Even with RLS, it's best practice to verify the user server-side before proceeding.

Unvalidated body passed to .update(body): A malicious client can send arbitrary fields (e.g., id, created_at, owner_id) that get written directly to the database. Allowlist the mutable fields or validate with a schema (e.g., Zod).

Additionally, request.json() will throw on malformed input with no error handling.

This same pattern applies to all similar PUT/POST routes in this PR (jobs, candidates, profiles, recruitment-processes, etc.).

app/api/jobs/[id]/route.ts
Comment on lines +4 to +21
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
const { id } = await params;
const supabase = await createClient();
const body = await request.json();

const { data, error } = await supabase
.from("jobs")
.update(body)
.eq("id", id)
.select()
.single();

if (error) {
return NextResponse.json({ error: error.message }, { status: 500 });
}

return NextResponse.json(data);
}
@coderabbitai
coderabbitai bot
1 hour ago
⚠️ Potential issue | 🔴 Critical

Critical: No authentication or authorization checks on mutation endpoints.

Neither PUT nor DELETE verify that the caller is authenticated or authorized to modify this resource. Any unauthenticated request can update or delete any job by ID. Even if Supabase RLS provides a safety net, the API layer should enforce auth explicitly — RLS misconfigurations are a common source of breaches, and defense-in-depth is essential for a PR titled "Major security upgrades."

This same issue applies to all similar route files in this PR (candidates/[id], profiles/[id], companies/[id], applications/[id], recruitment-processes/[id], recruitment-steps/[id], interviews/[id], team/invites/[id]).

app/api/jobs/route.ts
Comment on lines +27 to +42
export async function POST(request: NextRequest) {
const supabase = await createClient();
const body = await request.json();

const { data, error } = await supabase
.from("jobs")
.insert(body)
.select()
.single();

if (error) {
return NextResponse.json({ error: error.message }, { status: 500 });
}

return NextResponse.json(data);
}
@coderabbitai
coderabbitai bot
1 hour ago
⚠️ Potential issue | 🔴 Critical

POST handler: no auth and no input validation — anyone can create jobs in any company.

The handler accepts the entire body and inserts it directly. An unauthenticated user can create jobs associated with any company_id. Validate the session, scope company_id from the authenticated user's profile, and allowlist accepted fields.

app/kanban/page.tsx
Comment on lines +92 to +119
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
@coderabbitai
coderabbitai bot
1 hour ago
⚠️ Potential issue | 🔴 Critical

Critical: Double useSortable registration with the same id will break drag-and-drop.

Both SortableKanbanColumn (Line 100) and KanbanColumnWrapper (Line 513) call useSortable({ id: step.id, ... }) for the same step. Registering two sortable nodes with an identical ID within the same SortableContext causes @dnd-kit to track duplicate entries, leading to unpredictable drag behavior (jumps, wrong transforms, or silent failures).

The intent is clear: SortableKanbanColumn provides the outer transform wrapper, while KanbanColumnWrapper extracts attributes/listeners for the drag handle. The fix is to have SortableKanbanColumn pass its own attributes and listeners down instead of having the child re-register.

🐛 Proposed fix: pass drag handle props from SortableKanbanColumn via render prop
Also applies to: 501-526


app/kanban/page.tsx
Comment on lines +273 to +293
// Handle Card Moving
const applicationId = active.id as string;
const newStatus = over.id as ApplicationStatus;
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
@coderabbitai
coderabbitai bot
1 hour ago
⚠️ Potential issue | 🔴 Critical

Card drop onto a Column sortable (not ColumnDroppable) sets an invalid status.

When a card is dragged over a SortableKanbanColumn (whose data.type is 'Column'), neither the 'ColumnDroppable' nor the 'Card' branch matches, so newStatus remains over.id — which is the column's step.id (a UUID), not a valid status value. This would corrupt the application's status in the database.

Add a handler for the 'Column' over-type:

app/recruitment/[id]/page.tsx
Comment on lines +75 to +95
useEffect(() => {
if (processes.length > 0 && processId) {
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

        setIsLoadingProcess(false);
      }
    }
}, [processes, processId]);
@coderabbitai
coderabbitai bot
1 hour ago
⚠️ Potential issue | 🔴 Critical

useEffect overwrites local form edits on every query refresh.

This effect runs whenever processes changes (e.g., after any React Query background refetch or mutation invalidation). It unconditionally re-sets all local form state (roleName, departmentId, description, meetingNotes, jobAd, plannedInterviews) from the server data, discarding any unsaved user edits.

Use a ref or a flag to ensure initialization happens only once:

components/settings/team-management.tsx
Comment on lines +28 to +48
const handleInvite = async (e: React.FormEvent) => {
e.preventDefault();
setIsInviting(true);

    try {
      createInvite(
        { email, role: "customer" },
        {
          onSuccess: () => {
            toast.success(`Inbjudan skickad till ${email}`);
            setEmail("");
          },
          onError: (error: any) => {
            toast.error(error.message || "Kunde inte skicka inbjudan.");
          },
        }
      );
    } finally {
      setIsInviting(false);
    }
};
@coderabbitai
coderabbitai bot
1 hour ago
⚠️ Potential issue | 🔴 Critical

isInviting resets immediately — loading state doesn't track the actual mutation.

createInvite is useMutation.mutate (fire-and-forget), so the finally block on line 45 executes synchronously right after the call, resetting isInviting before the request completes. The spinner on line 143 will never be visible.

Use the mutation's built-in isPending state, or switch to mutateAsync:

🐛 Option 1: Use mutateAsync (if exposed by the hook)
🐛 Option 2: Move setIsInviting(false) into callbacks

supabase/migrations/010_team_invites.sql
Comment on lines +46 to +50
DROP POLICY IF EXISTS "Allow public to view invite by token" ON invites;
CREATE POLICY "Allow public to view invite by token"
ON invites FOR SELECT
TO anon
USING (expires_at > NOW() AND accepted_at IS NULL);
@coderabbitai
coderabbitai bot
1 hour ago
⚠️ Potential issue | 🔴 Critical

Critical: Anonymous users can enumerate all pending invites (emails + tokens).

The intent is to let anon look up a single invite by token, but the RLS USING clause only checks expires_at > NOW() AND accepted_at IS NULL — it doesn't filter by token. Any anonymous user can SELECT * FROM invites and retrieve all pending invites, exposing every invitee's email address and their secret tokens (which can be used to accept invitations as someone else).

RLS policies define row visibility; the application-level WHERE token = ? is not a security boundary since anon can simply omit it. You need to restrict the visible rows more tightly, or use a server-side function instead.

Option A: Use a security-definer function instead
Option B: If anon policy is still desired, at minimum don't expose the token

