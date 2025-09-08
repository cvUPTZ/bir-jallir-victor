import { useAuth } from "@/hooks/useAuth";
import Index from "./Index";
import RepresentativeDashboard from "./RepresentativeDashboard";
import { Skeleton } from "@/components/ui/skeleton";

const HomePage = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (profile?.role === 'admin') {
    return <Index />;
  }

  if (profile?.role === 'representative') {
    return <RepresentativeDashboard />;
  }

  // Fallback for when profile is not loaded or role is not recognized
  return <div>Redirecting to login...</div>;
};

export default HomePage;
