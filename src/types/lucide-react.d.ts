declare module "lucide-react" {
  export interface LucideProps {
    className?: string;
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }

  export type LucideIcon = (props: LucideProps) => any;

  export const Clock: LucideIcon;
  export const Lock: LucideIcon;
  export const Check: LucideIcon;
}
