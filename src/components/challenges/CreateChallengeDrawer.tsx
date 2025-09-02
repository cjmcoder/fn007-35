import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { useUI } from "@/store/useUI";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function CreateChallengeDrawer() {
  const open = useUI((s) => s.createChallengeOpen);
  const setOpen = useUI((s) => s.setCreateChallengeOpen);
  const navigate = useNavigate();

  const [mode, setMode] = React.useState<"open" | "private">("open");
  const [consoleSel, setConsoleSel] = React.useState("PC");
  const [gameSel, setGameSel] = React.useState("Madden NFL 25");
  const [modeSel, setModeSel] = React.useState("Normal");
  const [amount, setAmount] = React.useState(0);
  const [rules, setRules] = React.useState("");

  const onSubmit = () => {
    toast.info("Challenge flow is static for now.");
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="bg-background border-t border-border">
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader className="pb-2">
            <DrawerTitle>Create a Challenge</DrawerTitle>
            <DrawerDescription>Select your options then submit</DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-6 space-y-4">
            <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="open">OPEN</TabsTrigger>
                <TabsTrigger value="private">PRIVATE</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="rounded-md border border-border divide-y divide-border bg-card">
              <div className="p-4 grid grid-cols-2 items-center gap-4">
                <Label className="text-muted-foreground">Console</Label>
                <Select value={consoleSel} onValueChange={setConsoleSel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select console" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PC">PC</SelectItem>
                    <SelectItem value="PS5">PlayStation 5</SelectItem>
                    <SelectItem value="Xbox">Xbox Series</SelectItem>
                    <SelectItem value="Switch">Nintendo Switch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 grid grid-cols-2 items-center gap-4">
                <Label className="text-muted-foreground">Game</Label>
                <Select value={gameSel} onValueChange={setGameSel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select game" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Madden NFL 25">Madden NFL 25</SelectItem>
                    <SelectItem value="EA FC 25">EA Sports FC 25</SelectItem>
                    <SelectItem value="NBA 2K25">NBA 2K25</SelectItem>
                    <SelectItem value="COD MW3">Call of Duty: MW3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 grid grid-cols-2 items-center gap-4">
                <Label className="text-muted-foreground">Game Mode</Label>
                <Select value={modeSel} onValueChange={setModeSel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Ranked">Ranked</SelectItem>
                    <SelectItem value="Hardcore">Hardcore</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 grid grid-cols-2 items-center gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Amount (USD)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="$0.00"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Rules</Label>
              <Textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="Proposed Rules and Settings"
                className="min-h-24"
              />
            </div>

            <Button className="w-full" size="lg" onClick={onSubmit}>Submit</Button>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button variant="outline" className="w-full" onClick={() => { setOpen(false); navigate('/support'); }}>Site Rules</Button>
              <Button variant="outline" className="w-full" onClick={() => { setOpen(false); navigate('/support'); }}>How It Works</Button>
              <Button variant="outline" className="w-full" onClick={() => { setOpen(false); navigate('/support'); }}>Record Your Games</Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
