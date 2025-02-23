import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadTaskZero, downloadTaskOne, downloadTaskTwo, downloadTaskThree, downloadTaskFour } from "@/lib/docx-utils";
import { WorkflowTask } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

export function DownloadModal() {
  const [location] = useLocation();
  const workflowId = location.split('/').pop();
  const isNumeric = (str: string) => !isNaN(Number(str));
  const currentId = isNumeric(workflowId || '') ? workflowId : undefined;

  const { data: workflow } = useQuery<WorkflowTask>({
    queryKey: [`/api/workflow/${currentId}`],
    enabled: !!currentId,
  });

  if (!workflow?.taskZeroInputs) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full bg-green-600 hover:bg-green-700 text-white">
          <Download className="w-4 h-4 mr-2" />
          Completed All Tasks
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Download Task Reports</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            onClick={() => downloadTaskZero(workflow.taskZeroInputs!)}
            className="w-full"
          >
            Download Task 0 Report
          </Button>
          <Button
            onClick={() => workflow.taskOneResponses && downloadTaskOne(workflow.taskOneResponses)}
            className="w-full"
            disabled={!workflow.taskOneResponses}
          >
            Download Task 1 Report
          </Button>
          <Button
            onClick={() => workflow.taskTwoResponses && downloadTaskTwo(workflow.taskTwoResponses)}
            className="w-full"
            disabled={!workflow.taskTwoResponses}
          >
            Download Task 2 Report
          </Button>
          <Button
            onClick={() => workflow.taskThreeResponses && downloadTaskThree(workflow.taskThreeResponses)}
            className="w-full"
            disabled={!workflow.taskThreeResponses}
          >
            Download Task 3 Report
          </Button>
          <Button
            onClick={() => workflow.taskFourResponses && downloadTaskFour(workflow.taskFourResponses)}
            className="w-full"
            disabled={!workflow.taskFourResponses}
          >
            Download Task 4 Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
