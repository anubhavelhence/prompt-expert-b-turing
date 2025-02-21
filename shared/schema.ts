import { pgTable, text, serial, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workflowTasks = pgTable("workflow_tasks", {
  id: serial("id").primaryKey(),
  taskZeroInputs: json("task_zero_inputs").$type<{
    expert_a_domain: string;
    expert_a_subdomain: string;
    expert_a_difficulty_score: number;
    expert_a_problem: string;
    expert_a_rubric: string;
    expert_a_incorrect_1: string;
    expert_a_incorrect_2: string;
    expert_a_correct: string;
    expert_a_incorrect_1_rubric_test: string;
    expert_a_incorrect_2_rubric_test: string;
    expert_a_correct_rubric_test: string;
  }>(),
  taskOneResponses: json("task_one_responses").$type<{
    metadataQuality: number;
    domainCorrect: boolean;
    subdomainCorrect: boolean;
    difficultyScore: number;
    quality: string;
    suggestions: string;
    correctAnswerGrade: number;
    correctAnswerRationale: string;
    incorrectAnswer1Grade: number;
    incorrectAnswer1Rationale: string;
    incorrectAnswer2Grade: number;
    incorrectAnswer2Rationale: string;
  }>().default(null),
  currentStep: text("current_step").default("task-zero"),
});

export const taskZeroSchema = z.object({
  expert_a_domain: z.string().min(1, "Domain is required"),
  expert_a_subdomain: z.string().min(1, "Subdomain is required"),
  expert_a_difficulty_score: z.number().min(1).max(5),
  expert_a_problem: z.string().min(1, "Problem is required"),
  expert_a_rubric: z.string().min(1, "Rubric is required"),
  expert_a_incorrect_1: z.string().min(1, "Incorrect answer 1 is required"),
  expert_a_incorrect_2: z.string().min(1, "Incorrect answer 2 is required"),
  expert_a_correct: z.string().min(1, "Correct answer is required"),
  expert_a_incorrect_1_rubric_test: z.string().min(1, "Rubric test 1 is required"),
  expert_a_incorrect_2_rubric_test: z.string().min(1, "Rubric test 2 is required"),
  expert_a_correct_rubric_test: z.string().min(1, "Correct rubric test is required"),
});

export const taskOneResponseSchema = z.object({
  metadataQuality: z.number().min(1).max(5),
  domainCorrect: z.boolean(),
  subdomainCorrect: z.boolean(),
  difficultyScore: z.number().min(0).max(5),
  quality: z.string().min(1, "Quality assessment is required"),
  suggestions: z.string().min(1, "Suggestions are required"),
  correctAnswerGrade: z.number().min(0).max(1),
  correctAnswerRationale: z.string().min(1, "Rationale is required"),
  incorrectAnswer1Grade: z.number().min(0).max(1),
  incorrectAnswer1Rationale: z.string().min(1, "Rationale for incorrect answer 1 is required"),
  incorrectAnswer2Grade: z.number().min(0).max(1),
  incorrectAnswer2Rationale: z.string().min(1, "Rationale for incorrect answer 2 is required"),
});

export const insertWorkflowSchema = createInsertSchema(workflowTasks);

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type WorkflowTask = typeof workflowTasks.$inferSelect;
export type TaskZeroInputs = z.infer<typeof taskZeroSchema>;
export type TaskOneResponse = z.infer<typeof taskOneResponseSchema>;