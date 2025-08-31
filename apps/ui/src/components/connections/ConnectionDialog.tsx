import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DatabaseConnection } from "@/entities/all";
import { Database } from "lucide-react";
import { useEffect, useState } from "react";

interface ConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection?: DatabaseConnection | null;
  onSave: (connection: DatabaseConnection) => void;
  onCancel: () => void;
}

export default function ConnectionDialog({ open, onOpenChange, connection, onSave, onCancel }: ConnectionDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "postgresql" as "postgresql" | "mysql",
    host: "",
    port: 5432,
    database: "",
    username: "",
    password: "",
    is_active: true
  });

  useEffect(() => {
    if (connection) {
      setFormData(connection);
    } else {
      setFormData({ name: "", type: "postgresql", host: "", port: 5432, database: "", username: "", password: "", is_active: true });
    }
  }, [connection, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(new DatabaseConnection(formData));
  };

  const handleTypeChange = (type: string) => {
    const dbType = type as "postgresql" | "mysql";
    setFormData(prev => ({ ...prev, type: dbType, port: dbType === 'postgresql' ? 5432 : 3306 }));
  };

  interface InputFieldProps {
    id: string;
    label: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
    required?: boolean;
  }
  
  const InputField = ({ id, label, ...props }: InputFieldProps) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-600">{label}</Label>
      <Input id={id} className="bg-muted border-none" {...props} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Database className="w-5 h-5" />
            {connection ? 'Edit Connection' : 'New Connection'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <InputField id="name" label="Connection Name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="My Production DB" required />
          
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium text-gray-600">Database Type</Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="bg-muted border-none"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="postgresql">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <InputField id="host" label="Host" value={formData.host} onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))} placeholder="localhost" required />
            </div>
            <InputField id="port" label="Port" type="number" value={formData.port} onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) }))} required />
          </div>

          <InputField id="database" label="Database" value={formData.database} onChange={(e) => setFormData(prev => ({ ...prev, database: e.target.value }))} placeholder="myapp_production" required />
          <InputField id="username" label="Username" value={formData.username} onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))} placeholder="postgres" required />
          <InputField id="password" label="Password" type="password" value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} placeholder="••••••••" />
          
          <div className="flex items-center space-x-3 pt-2">
            <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))} />
            <Label htmlFor="is_active" className="text-sm font-medium text-gray-600">Active connection</Label>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit">{connection ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}