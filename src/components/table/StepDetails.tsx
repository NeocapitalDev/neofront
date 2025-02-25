import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { UpdateStepForm } from "@/pages/prueba3/UpdateStepForm";

export interface Subcategory {
  id: string | number;
  name: string;
}

export interface Stage {
  id: string | number;
  name: string;
}

export interface Step {
  name: string;
  subcategories: Subcategory[];
  stages: Stage[];
}

interface StepDetailsProps {
  step: Step;
  data: any;
}

export function StepDetails({ step, data }: StepDetailsProps) {
  console.log(data);
  const [newData, setnewData] = useState(null);
  const handleEditing = (data) => {
    setnewData(data);
  };
  return (
    <Card className="border-0">
      <CardHeader>
        {newData ? (
          <CardTitle>{newData.name}</CardTitle>
        ) : (
          <CardTitle>{step.name}</CardTitle>
        )}
        <CardDescription>Detailed information about this step</CardDescription>
      </CardHeader>
      <CardContent className="">
        {/* Subcategories Section */}
        {/* <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Subcategories
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {step.subcategories.map((subcat) => (
              <Card key={subcat.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{subcat.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ID: {subcat.id}
                      </p>
                    </div>
                    <Badge variant="secondary">Subcategory</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div> */}

        {/* Stages Section */}
        {/* <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Stages
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {step.stages.map((stage) => (
              <Card key={stage.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{stage.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ID: {stage.id}
                      </p>
                    </div>
                    <Badge>Stage</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div> */}

        <UpdateStepForm step={data} setNewData={handleEditing} />
      </CardContent>
    </Card>
  );
}
