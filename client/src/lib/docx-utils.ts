import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import { 
  TaskZeroInputs, 
  TaskOneResponse, 
  TaskTwoResponse, 
  TaskThreeResponse, 
  TaskFourResponse 
} from "@shared/schema";

function createDownloadableDoc(content: string[][]): Document {
  const doc = new Document({
    sections: [{
      properties: {},
      children: content.map(([heading, text]) => ([
        new Paragraph({
          children: [
            new TextRun({
              text: heading,
              bold: true,
              size: 28,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: text || "Not provided",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          children: [new TextRun({ text: "" })],
        }),
      ])).flat(),
    }],
  });
  return doc;
}

export async function downloadTaskZero(data: TaskZeroInputs) {
  const content = [
    ["Domain:", data.expert_a_domain],
    ["Subdomain:", data.expert_a_subdomain],
    ["Difficulty Score:", data.expert_a_difficulty_score.toString()],
    ["Problem:", data.expert_a_problem],
    ["Rubric:", data.expert_a_rubric],
    ["Correct Answer:", data.expert_a_correct],
    ["Incorrect Answer 1:", data.expert_a_incorrect_1],
    ["Incorrect Answer 2:", data.expert_a_incorrect_2],
    ["Correct Answer Rubric Test:", data.expert_a_correct_rubric_test],
    ["Incorrect Answer 1 Rubric Test:", data.expert_a_incorrect_1_rubric_test],
    ["Incorrect Answer 2 Rubric Test:", data.expert_a_incorrect_2_rubric_test],
  ];
  
  const doc = createDownloadableDoc(content);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "task-zero-submission.docx");
}

export async function downloadTaskOne(data: TaskOneResponse) {
  const content = [
    ["Metadata Quality:", data.metadataQuality.toString()],
    ["Domain Correct:", data.domainCorrect ? "Yes" : "No"],
    ["Subdomain Correct:", data.subdomainCorrect ? "Yes" : "No"],
    ["Difficulty Score:", data.difficultyScore.toString()],
    ["Quality:", data.quality],
    ["Suggestions:", data.suggestions],
    ["Correct Answer Grade:", data.correctAnswerGrade.toString()],
    ["Correct Answer Rationale:", data.correctAnswerRationale],
    ["Incorrect Answer 1 Grade:", data.incorrectAnswer1Grade.toString()],
    ["Incorrect Answer 1 Rationale:", data.incorrectAnswer1Rationale],
    ["Incorrect Answer 2 Grade:", data.incorrectAnswer2Grade.toString()],
    ["Incorrect Answer 2 Rationale:", data.incorrectAnswer2Rationale],
  ];

  const doc = createDownloadableDoc(content);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "task-one-submission.docx");
}

export async function downloadTaskTwo(data: TaskTwoResponse) {
  const content = data.rubricItems.flatMap((item, index) => [
    [`Rubric Item ${index + 1} - ${item.name}:`, ""],
    ["Correct Score:", item.correctScore.toString()],
    ["Incorrect Score 1:", item.incorrectScore1.toString()],
    ["Incorrect Score 2:", item.incorrectScore2.toString()],
    ["Correct Rationale:", item.correctRationale],
    ["Incorrect Rationale 1:", item.incorrectRationale1],
    ["Incorrect Rationale 2:", item.incorrectRationale2],
    ["Technical Accuracy:", item.technicalAccuracy.toString()],
    ["Relevance & Necessity:", item.relevanceNecessity.toString()],
    ["Partial Credit Structure:", item.partialCreditStructure.toString()],
    ["Differing Answers:", item.differingAnswers ? "Yes" : "No"],
    ["Weighting:", item.weighting.toString()],
    ["Clarity & Objectivity:", item.clarityObjectivity.toString()],
    ["Differentiation Power:", item.differentiationPower.toString()],
    ["", ""], // Add spacing between rubric items
  ]);

  const doc = createDownloadableDoc(content);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "task-two-submission.docx");
}

export async function downloadTaskThree(data: TaskThreeResponse) {
  const content = [
    ["Correct Answer Grade:", data.correctAnswerGrade.toString()],
    ["Correct Answer Rationale:", data.correctAnswerRationale],
    ["Incorrect Answer 1 Grade:", data.incorrectAnswer1Grade.toString()],
    ["Incorrect Answer 1 Rationale:", data.incorrectAnswer1Rationale],
    ["Incorrect Answer 2 Grade:", data.incorrectAnswer2Grade.toString()],
    ["Incorrect Answer 2 Rationale:", data.incorrectAnswer2Rationale],
  ];

  const doc = createDownloadableDoc(content);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "task-three-submission.docx");
}

export async function downloadTaskFour(data: TaskFourResponse) {
  const content = [
    ["Overall Rubrics Completeness:", data.overallRubricsCompleteness.toString()],
    ["Overall Rubrics Clarity:", data.overallRubricsClarity.toString()],
    ["Overall Rubrics Flexibility:", data.overallRubricsFlexibility.toString()],
    ["Evaluate Rubrics Rationale:", data.evaluateRubricsRationale],
  ];

  const doc = createDownloadableDoc(content);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "task-four-submission.docx");
}
