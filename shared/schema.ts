import { pgTable, text, serial, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Task four types and schema
export const taskFourResponseSchema = z.object({
  overallRubricsCompleteness: z.number().min(1).max(4),
  overallRubricsClarity: z.number().min(1).max(4),
  overallRubricsFlexibility: z.number().min(1).max(4),
  evaluateRubricsRationale: z.string().optional().default(""),
});

// Update workflowTasks table with optional fields
export const workflowTasks = pgTable("workflow_tasks", {
  id: serial("id").primaryKey(),
  taskZeroInputs: json("task_zero_inputs").$type<z.infer<typeof taskZeroSchema>>(),
  taskOneResponses: json("task_one_responses").$type<z.infer<typeof taskOneResponseSchema>>(),
  taskTwoResponses: json("task_two_responses").$type<z.infer<typeof taskTwoResponseSchema>>(),
  taskThreeResponses: json("task_three_responses").$type<z.infer<typeof taskThreeResponseSchema>>(),
  taskFourResponses: json("task_four_responses").$type<z.infer<typeof taskFourResponseSchema>>(),
  currentStep: text("current_step").default("task-zero"),
});

// Make all fields in Task Zero optional
export const taskZeroSchema = z.object({
  expert_a_domain: z.string().optional().default(""),
  expert_a_subdomain: z.string().optional().default(""),
  expert_a_difficulty_score: z.number().optional().default(1),
  expert_a_problem: z.string().optional().default(""),
  expert_a_rubric: z.string().optional().default(""),
  expert_a_incorrect_1: z.string().optional().default(""),
  expert_a_incorrect_2: z.string().optional().default(""),
  expert_a_correct: z.string().optional().default(""),
  expert_a_incorrect_1_rubric_test: z.string().optional().default(""),
  expert_a_incorrect_2_rubric_test: z.string().optional().default(""),
  expert_a_correct_rubric_test: z.string().optional().default(""),
});

export const taskOneResponseSchema = z.object({
  metadataQuality: z.number().min(1).max(5),
  domainCorrect: z.boolean(),
  subdomainCorrect: z.boolean(),
  difficultyScore: z.number().min(0).max(5),
  quality: z.string().optional().default(""),
  suggestions: z.string().optional().default(""),
  correctAnswerGrade: z.number().min(0).max(1),
  correctAnswerRationale: z.string().optional().default(""),
  incorrectAnswer1Grade: z.number().min(0).max(1),
  incorrectAnswer1Rationale: z.string().optional().default(""),
  incorrectAnswer2Grade: z.number().min(0).max(1),
  incorrectAnswer2Rationale: z.string().optional().default(""),
});

export const taskTwoResponseSchema = z.object({
  rubricItems: z.array(z.object({
    name: z.string().min(1, "Rubric item name is required"),
    correctScore: z.number().min(0).max(2),
    incorrectScore1: z.number().min(0).max(2),
    incorrectScore2: z.number().min(0).max(2),
    correctRationale: z.string().optional().default(""),
    incorrectRationale1: z.string().optional().default(""),
    incorrectRationale2: z.string().optional().default(""),
    technicalAccuracy: z.number().min(1).max(4),
    relevanceNecessity: z.number().min(1).max(4),
    partialCreditStructure: z.number().min(1).max(4),
    differingAnswers: z.boolean(),
    weighting: z.number().min(1).max(4),
    clarityObjectivity: z.number().min(1).max(4),
    differentiationPower: z.number().min(1).max(4),
  })),
});

export const taskThreeResponseSchema = z.object({
  correctAnswerGrade: z.number().min(0).max(4),
  correctAnswerRationale: z.string().optional().default(""),
  incorrectAnswer1Grade: z.number().min(0).max(4),
  incorrectAnswer1Rationale: z.string().optional().default(""),
  incorrectAnswer2Grade: z.number().min(0).max(4),
  incorrectAnswer2Rationale: z.string().optional().default(""),
});

export const insertWorkflowSchema = createInsertSchema(workflowTasks);

// Export types
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type WorkflowTask = typeof workflowTasks.$inferSelect;
export type TaskZeroInputs = z.infer<typeof taskZeroSchema>;
export type TaskOneResponse = z.infer<typeof taskOneResponseSchema>;
export type TaskTwoResponse = z.infer<typeof taskTwoResponseSchema>;
export type TaskThreeResponse = z.infer<typeof taskThreeResponseSchema>;
export type TaskFourResponse = z.infer<typeof taskFourResponseSchema>;