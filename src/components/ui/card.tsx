// src/components/ui/card.js
export function Card({ children, className }) {
    return <div className={`rounded-lg border p-4 shadow ${className}`}>{children}</div>;
  }
  
  export function CardHeader({ children }) {
    return <div className="mb-4">{children}</div>;
  }
  
  export function CardTitle({ children }) {
    return <h2 className="text-xl font-bold">{children}</h2>;
  }
  
  export function CardDescription({ children }) {
    return <p className="text-sm text-gray-500">{children}</p>;
  }
  
  export function CardContent({ children }) {
    return <div>{children}</div>;
  }
  
  export function CardFooter({ children }) {
    return <div className="mt-4">{children}</div>;
  }
  