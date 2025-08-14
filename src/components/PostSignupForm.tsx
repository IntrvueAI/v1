import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface PostSignupFormProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const PostSignupForm = ({ isOpen, onClose, userId }: PostSignupFormProps) => {
  const [schools, setSchools] = useState<string[]>([""]);
  const [interviewDate, setInterviewDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addSchoolField = () => {
    setSchools([...schools, ""]);
  };

  const removeSchoolField = (index: number) => {
    setSchools(schools.filter((_, i) => i !== index));
  };

  const updateSchool = (index: number, value: string) => {
    const updatedSchools = [...schools];
    updatedSchools[index] = value;
    setSchools(updatedSchools);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const filteredSchools = schools.filter(school => school.trim() !== "");
      
      const { error } = await supabase
        .from("profiles")
        .update({
          schools: filteredSchools.length > 0 ? filteredSchools : null,
          interview_date: interviewDate ? interviewDate.toISOString().split('T')[0] : null,
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Information saved!",
        description: "Your school and interview details have been saved.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error saving post-signup info:", error);
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tell us about your interview</DialogTitle>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardDescription>
              Help us personalize your experience by sharing details about your upcoming interviews (optional).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="schools">Schools you're applying to</Label>
              <div className="space-y-2 mt-2">
                {schools.map((school, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={school}
                      onChange={(e) => updateSchool(index, e.target.value)}
                      placeholder="Enter school name"
                    />
                    {schools.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSchoolField(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSchoolField}
                  className="w-full"
                >
                  Add another school
                </Button>
              </div>
            </div>

            <div>
              <Label>Interview date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-2",
                      !interviewDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {interviewDate ? format(interviewDate, "PPP") : "Select interview date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={interviewDate}
                    onSelect={setInterviewDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSkip} variant="outline" className="flex-1">
                Skip for now
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};