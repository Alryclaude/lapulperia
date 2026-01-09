// shadcn/ui components for La Pulperia
// Re-export all UI components

// P0 - Core components
export { Button, buttonVariants } from './button';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardInteractive,
} from './card';
export { Input, SearchInput, Textarea } from './input';
export { Badge, StatusBadge, badgeVariants } from './badge';

// P1 - Interactive components
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './sheet';

// P2 - Layout components
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsListUnderlined,
  TabsTriggerUnderlined,
} from './tabs';

export { Separator } from './separator';

export {
  Skeleton,
  SkeletonCard,
  SkeletonProductCard,
  SkeletonPulperiaCard,
  SkeletonList,
  SkeletonText,
} from './skeleton';

// Animated components
export {
  AnimatedList,
  AnimatedListItem,
  AnimatedCard,
  FadeInView,
  AnimatedPresenceList,
  AnimatedCounter,
  Collapse,
} from './animated';
