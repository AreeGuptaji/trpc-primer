import ReactDOM from "react-dom/client";
import { queryClient, trpc } from "./utils/trpc";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { Greeting } from "./Greeting";
const App = () => (
  <QueryClientProvider client={queryClient}>
    <Greeting />
  </QueryClientProvider>
);

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);

root.render(<App />);
