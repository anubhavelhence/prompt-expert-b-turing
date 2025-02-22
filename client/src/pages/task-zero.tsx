import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TaskZeroInputs, taskZeroSchema } from "@shared/schema";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function TaskZero() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<TaskZeroInputs>({
    resolver: zodResolver(taskZeroSchema),
    defaultValues: {
      expert_a_domain: "",
      expert_a_subdomain: "",
      expert_a_difficulty_score: 1,
      expert_a_problem: "",
      expert_a_rubric: "",
      expert_a_incorrect_1: "",
      expert_a_incorrect_2: "",
      expert_a_correct: "",
      expert_a_incorrect_1_rubric_test: "",
      expert_a_incorrect_2_rubric_test: "",
      expert_a_correct_rubric_test: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: TaskZeroInputs) => {
      const res = await apiRequest("POST", "/api/workflow", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Task 0 completed",
        description: "Moving to Task 1",
      });
      setLocation(`/task-one/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save Task 0 data",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Task 0: Initial Information from Expert A Question</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label>Domain</label>
                  <Input {...form.register("expert_a_domain")} />
                </div>
                <div className="space-y-2">
                  <label>Subdomain</label>
                  <Input {...form.register("expert_a_subdomain")} />
                </div>
              </div>

              <div className="space-y-2">
                <label>Difficulty Score (1-5)</label>
                <Input 
                  type="number" 
                  min={1} 
                  max={5}
                  {...form.register("expert_a_difficulty_score", { valueAsNumber: true })} 
                />
              </div>

              <div className="space-y-2">
                <label>Problem</label>
                <Textarea {...form.register("expert_a_problem")} />
              </div>

              <div className="space-y-2">
                <label>Rubric</label>
                <Textarea {...form.register("expert_a_rubric")} />
              </div>

              <div className="space-y-2">
                <label>Incorrect Answer 1</label>
                <Textarea {...form.register("expert_a_incorrect_1")} />
              </div>

              <div className="space-y-2">
                <label>Incorrect Answer 2</label>
                <Textarea {...form.register("expert_a_incorrect_2")} />
              </div>

              <div className="space-y-2">
                <label>Correct Answer</label>
                <Textarea {...form.register("expert_a_correct")} />
              </div>

              <div className="space-y-2">
                <label>Incorrect 1 Rubric Test</label>
                <Textarea {...form.register("expert_a_incorrect_1_rubric_test")} />
              </div>

              <div className="space-y-2">
                <label>Incorrect 2 Rubric Test</label>
                <Textarea {...form.register("expert_a_incorrect_2_rubric_test")} />
              </div>

              <div className="space-y-2">
                <label>Correct Rubric Test</label>
                <Textarea {...form.register("expert_a_correct_rubric_test")} />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving..." : "Continue to Task 1"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}