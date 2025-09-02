import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useUI } from "@/store/useUI";

export const ChallengeTabs = ({ children }: { children: React.ReactNode }) => {
  const { activeTab, setActiveTab } = useUI();

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
      <TabsList className="grid w-full grid-cols-4 bg-card/50 border border-border">
        <TabsTrigger 
          value="challenges" 
          className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30"
        >
          <div className="flex items-center space-x-2">
            <span>Skill Challenges</span>
            <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30 text-xs">
              24
            </Badge>
          </div>
        </TabsTrigger>
        
        <TabsTrigger 
          value="players" 
          className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30"
        >
          <div className="flex items-center space-x-2">
            <span>Players</span>
            <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple/30 text-xs">
              127
            </Badge>
          </div>
        </TabsTrigger>
        
        <TabsTrigger 
          value="tournaments" 
          className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30"
        >
          <div className="flex items-center space-x-2">
            <span>Tournaments</span>
            <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange/30 text-xs">
              8
            </Badge>
          </div>
        </TabsTrigger>
        
        <TabsTrigger 
          value="props" 
          className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30"
        >
          <div className="flex items-center space-x-2">
            <span>Skill Props</span>
            <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs">
              15
            </Badge>
          </div>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value={activeTab} className="mt-6">
        {children}
      </TabsContent>
    </Tabs>
  );
};