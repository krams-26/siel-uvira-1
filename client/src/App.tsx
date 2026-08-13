import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { DossiersPage, SchoolsPage } from "./pages/Operations";
import GedPage from "./pages/GedPage";
import ReportsPage from "./pages/ReportsPage";
import StatisticsPage from "./pages/StatisticsPage";
import TemplatesPage from "./pages/TemplatesPage";
import CommissionPage from "./pages/CommissionPage";
import SectionPage from "./pages/SectionPage";
import PersonnelPage from "./pages/PersonnelPage";
import ActesPage from "./pages/ActesPage";
import SchoolDetailPage from "./pages/SchoolDetailPage";
import SchoolPortalPage from "./pages/SchoolPortalPage";
import SchoolAccountsPage from "./pages/SchoolAccountsPage";
import CommunicationPage from "./pages/CommunicationPage";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dossiers"} component={DossiersPage} />
      <Route path={"/ecoles"} component={SchoolsPage} />
      <Route path={"/gestion-ecoles"} component={SchoolsPage} />
      <Route path={"/ecoles/:id"} component={SchoolDetailPage} />
      <Route path={"/ged"} component={GedPage} />
      <Route path={"/documents-rapports"} component={GedPage} />
      <Route path={"/rapports"} component={ReportsPage} />
      <Route path={"/portail-ecoles"} component={SchoolPortalPage} />
      <Route path={"/statistiques"} component={StatisticsPage} />
      <Route path={"/modeles"} component={TemplatesPage} />
      <Route path={"/commission-affectation"} component={CommissionPage} />
      <Route path={"/actes-administratifs"} component={ActesPage} />
      <Route path={"/personnel"} component={PersonnelPage} />
      <Route path={"/actes"} component={SectionPage} />
      <Route path={"/communication"} component={CommunicationPage} />
      <Route path={"/parametres"} component={SectionPage} />
      <Route path={"/permissions"} component={SectionPage} />
      <Route path={"/utilisateurs"} component={SchoolAccountsPage} />
      <Route path={"/bureaux"} component={SectionPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
