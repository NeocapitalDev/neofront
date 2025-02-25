import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Challenge_products {
  id: string | number;
  name: string;
}

export interface Challenge_subcategory {
  id: string | number;
  name: string;
}

export interface ChallengeRelationsStages {
  minimumTradingDays: number;
  maximumDailyLoss: number;
  maximumLoss: number;
  profitTarget: number;
  leverage: number;

  challenge_subcategory: Challenge_subcategory;
  challenge_products: Challenge_products[];
}

interface DetailsProps {
  prop: ChallengeRelationsStages;
}





export function PropDetails({ prop }: DetailsProps) {
 
  return (
    <Card>
      <CardHeader>
        <CardTitle>Parámetros y condiciones</CardTitle>
        {/* <CardTitle>{step.name}</CardTitle> */}
        <CardDescription>Detailed information about this step</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subcategories Section */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Productos
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {prop.challenge_products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ID: {product.id}
                      </p>
                    </div>
                    <Badge variant="secondary">Producto</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stages Section */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Subcategoria
          </h3>
          <div className="grid grid-cols-1 gap-2">
              <Card key={prop.challenge_subcategory.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{prop.challenge_subcategory.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ID: {prop.challenge_subcategory.id}
                      </p>
                    </div>
                    <Badge>Subcategoria</Badge>
                  </div>
                </CardContent>
              </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
