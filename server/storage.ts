import { workflowTasks, type WorkflowTask, type TaskZeroInputs, type TaskOneResponse } from "@shared/schema";

export interface IStorage {
  createWorkflow(taskZeroInputs: TaskZeroInputs): Promise<WorkflowTask>;
  getWorkflow(id: number): Promise<WorkflowTask | undefined>;
  updateWorkflowStep(id: number, step: string): Promise<WorkflowTask>;
  updateTaskOneResponses(id: number, responses: TaskOneResponse): Promise<WorkflowTask>;
}

export class MemStorage implements IStorage {
  private workflows: Map<number, WorkflowTask>;
  private currentId: number;

  constructor() {
    this.workflows = new Map();
    this.currentId = 1;
  }

  async createWorkflow(taskZeroInputs: TaskZeroInputs): Promise<WorkflowTask> {
    const id = this.currentId++;
    const workflow: WorkflowTask = {
      id,
      taskZeroInputs,
      taskOneResponses: null,
      currentStep: "task-zero",
    };
    this.workflows.set(id, workflow);
    return workflow;
  }

  async getWorkflow(id: number): Promise<WorkflowTask | undefined> {
    return this.workflows.get(id);
  }

  async updateWorkflowStep(id: number, step: string): Promise<WorkflowTask> {
    const workflow = await this.getWorkflow(id);
    if (!workflow) throw new Error("Workflow not found");
    
    const updated = { ...workflow, currentStep: step };
    this.workflows.set(id, updated);
    return updated;
  }

  async updateTaskOneResponses(id: number, responses: TaskOneResponse): Promise<WorkflowTask> {
    const workflow = await this.getWorkflow(id);
    if (!workflow) throw new Error("Workflow not found");
    
    const updated = { ...workflow, taskOneResponses: responses };
    this.workflows.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
