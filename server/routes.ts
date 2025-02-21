import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { taskZeroSchema, taskOneResponseSchema, taskTwoResponseSchema, taskThreeResponseSchema, taskFourResponseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/workflow", async (req, res) => {
    try {
      const taskZeroInputs = taskZeroSchema.parse(req.body);
      const workflow = await storage.createWorkflow(taskZeroInputs);
      res.json(workflow);
    } catch (error) {
      res.status(400).json({ error: "Invalid input data" });
    }
  });

  app.get("/api/workflow/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const workflow = await storage.getWorkflow(id);
    if (!workflow) {
      res.status(404).json({ error: "Workflow not found" });
      return;
    }
    res.json(workflow);
  });

  app.patch("/api/workflow/:id/step", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { step } = req.body;
      const workflow = await storage.updateWorkflowStep(id, step);
      res.json(workflow);
    } catch (error) {
      res.status(400).json({ error: "Invalid step update" });
    }
  });

  app.patch("/api/workflow/:id/task-one", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const responses = taskOneResponseSchema.parse(req.body);
      const workflow = await storage.updateTaskOneResponses(id, responses);
      res.json(workflow);
    } catch (error) {
      res.status(400).json({ error: "Invalid task one responses" });
    }
  });

  app.patch("/api/workflow/:id/task-two", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const responses = taskTwoResponseSchema.parse(req.body);
      const workflow = await storage.updateTaskTwoResponses(id, responses);
      res.json(workflow);
    } catch (error) {
      res.status(400).json({ error: "Invalid task two responses" });
    }
  });

  app.patch("/api/workflow/:id/task-three", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const responses = taskThreeResponseSchema.parse(req.body);
      const workflow = await storage.updateTaskThreeResponses(id, responses);
      res.json(workflow);
    } catch (error) {
      res.status(400).json({ error: "Invalid task three responses" });
    }
  });

  app.patch("/api/workflow/:id/task-four", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const responses = taskFourResponseSchema.parse(req.body);
      const workflow = await storage.updateTaskFourResponses(id, responses);
      res.json(workflow);
    } catch (error) {
      res.status(400).json({ error: "Invalid task four responses" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}