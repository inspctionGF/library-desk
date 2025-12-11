import { useState } from "react";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, GraduationCap, HandCoins, FileText, Sparkles } from "lucide-react";
import BookReportTab from "@/components/reports/BookReportTab";
import ClassReportTab from "@/components/reports/ClassReportTab";
import ParticipantReportTab from "@/components/reports/ParticipantReportTab";
import LoanReportTab from "@/components/reports/LoanReportTab";
import ResumeReportTab from "@/components/reports/ResumeReportTab";
import ExtraActivityReportTab from "@/components/reports/ExtraActivityReportTab";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("books");

  return (
    <AdminLayout>
      <Helmet>
        <title>Rapports | BiblioSystem</title>
        <meta name="description" content="Rapports et statistiques de la bibliothèque" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapports</h1>
          <p className="text-muted-foreground">
            Analyses et statistiques détaillées de votre bibliothèque
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto gap-2 bg-transparent p-0">
            <TabsTrigger
              value="books"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Livres</span>
            </TabsTrigger>
            <TabsTrigger
              value="classes"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Classes</span>
            </TabsTrigger>
            <TabsTrigger
              value="participants"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Participants</span>
            </TabsTrigger>
            <TabsTrigger
              value="loans"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <HandCoins className="h-4 w-4" />
              <span className="hidden sm:inline">Prêts</span>
            </TabsTrigger>
            <TabsTrigger
              value="resumes"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Résumés</span>
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Activités</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="mt-6">
            <BookReportTab />
          </TabsContent>

          <TabsContent value="classes" className="mt-6">
            <ClassReportTab />
          </TabsContent>

          <TabsContent value="participants" className="mt-6">
            <ParticipantReportTab />
          </TabsContent>

          <TabsContent value="loans" className="mt-6">
            <LoanReportTab />
          </TabsContent>

          <TabsContent value="resumes" className="mt-6">
            <ResumeReportTab />
          </TabsContent>

          <TabsContent value="activities" className="mt-6">
            <ExtraActivityReportTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Reports;
