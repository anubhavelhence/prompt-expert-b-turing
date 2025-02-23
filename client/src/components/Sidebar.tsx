import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { WorkflowTask } from "@shared/schema";

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Get the current workflow ID from the URL if it exists
  const workflowId = location.split('/').pop();
  const isNumeric = (str: string) => !isNaN(Number(str));
  const currentId = isNumeric(workflowId || '') ? workflowId : undefined;

  // If we're on a task page, fetch the workflow data
  const { data: workflow } = useQuery<WorkflowTask>({
    queryKey: [`/api/workflow/${currentId}`],
    enabled: !!currentId,
  });

  // Mutation to create a new workflow
  const createWorkflowMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/workflow", {});
      return response.json();
    },
    onSuccess: (data) => {
      // Navigate to the selected task with the new workflow ID
      const taskPath = location.split('/')[1];
      if (taskPath === "task-zero") {
        setLocation("/task-zero");
      } else {
        setLocation(`/${taskPath}/${data.id}`);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create new workflow",
        variant: "destructive",
      });
    },
  });

  const resetAll = () => {
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
    toast({
      title: "Reset Complete",
      description: "All data has been cleared. Please refresh the page.",
    });
  };

  const tasks = [
    { path: "/task-zero", label: "Task 0: Initial Information" },
    { path: "/task-one", label: "Task 1: Evaluate Problem" },
    { path: "/task-two", label: "Task 2: Grade Solutions" },
    { path: "/task-three", label: "Task 3: Evaluate Model Grading" },
    { path: "/task-four", label: "Task 4: Evaluate Rubric" },
  ];

  const handleTaskClick = (task: typeof tasks[0]) => {
    // Handle navigation to Task Zero
    if (task.path === "/task-zero") {
      setLocation("/task-zero");
      return;
    }

    // Create a new workflow and then navigate to the selected task
    createWorkflowMutation.mutate();
  };

  return (
    <div className="w-64 h-screen bg-card fixed left-0 top-0 border-r p-4 flex flex-col">
      <div className="space-y-2 flex-1">
        <h2 className="font-semibold mb-4">Task Navigation</h2>
        {tasks.map((task) => (
          <button
            key={task.path}
            className={cn(
              "block w-full text-left p-2 rounded-lg transition-colors",
              "hover:bg-accent",
              location.includes(task.path.split('/')[1]) && "bg-accent"
            )}
            onClick={() => handleTaskClick(task)}
            disabled={createWorkflowMutation.isPending}
          >
            {task.label}
          </button>
        ))}
      </div>
      <Button 
        variant="destructive" 
        className="w-full"
        onClick={resetAll}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset All
      </Button>
    </div>
  );
}