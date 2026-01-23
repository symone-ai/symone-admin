import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import AdminLogin from "./pages/admin/Login";
import AdminOverview from "./pages/admin/Overview";
import AdminUsers from "./pages/admin/Users";
import AdminPlans from "./pages/admin/Plans";
import AdminMCPs from "./pages/admin/MCPs";
import AdminActivity from "./pages/admin/Activity";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppAdmin = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <Routes>
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/" element={<Navigate to="/admin/login" replace />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/admin" element={<AdminLayout><AdminOverview /></AdminLayout>} />
                        <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
                        <Route path="/admin/plans" element={<AdminLayout><AdminPlans /></AdminLayout>} />
                        <Route path="/admin/mcps" element={<AdminLayout><AdminMCPs /></AdminLayout>} />
                        <Route path="/admin/activity" element={<AdminLayout><AdminActivity /></AdminLayout>} />
                        <Route path="/admin/analytics" element={<AdminLayout><AdminAnalytics /></AdminLayout>} />
                        <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default AppAdmin;
