import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { useState } from "react";

interface SaveQueryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, description: string) => void;
}

export default function SaveQueryDialog({ open, onOpenChange, onSave }: SaveQueryDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), description.trim());
      setName("");
      setDescription("");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setName("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Save className="w-5 h-5" />
            Save Query
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="query-name" className="text-sm font-medium text-gray-600">Query Name</Label>
            <Input
              id="query-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for this query"
              className="bg-muted border-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="query-description" className="text-sm font-medium text-gray-600">Description (optional)</Label>
            <Textarea
              id="query-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this query does"
              rows={3}
              className="bg-muted border-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!name.trim()}
          >
            Save Query
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}