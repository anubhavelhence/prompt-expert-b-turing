import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import TaskZero from "@/pages/task-zero";
import TaskOne from "@/pages/task-one";
import TaskTwo from "@/pages/task-two";
import TaskThree from "@/pages/task-three";
import TaskFour from "@/pages/task-four";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/task-zero" component={TaskZero} />
      <Route path="/task-one/:id" component={TaskOne} />
      <Route path="/task-two/:id" component={TaskTwo} />
      <Route path="/task-three/:id" component={TaskThree} />
      <Route path="/task-four/:id" component={TaskFour} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;