// ---------------------------------------------------------------------------
// Design System — Primitives Barrel Export
// ---------------------------------------------------------------------------
// Exposes all custom UI components and typography primitives.
// Import from "@/components/ui" — never from individual files.
// ---------------------------------------------------------------------------

// Typography
export {
  Display,
  Hero,
  Heading,
  Title,
  Subtitle,
  Body,
  Caption,
  Label,
  Metric,
  Code,
} from "./Typography";

// Buttons
export { Button, IconButton } from "./Button";
export type { ButtonProps, IconButtonProps } from "./Button";

// Inputs
export { Input, SearchInput } from "./Input";
export type { InputProps, SearchInputProps } from "./Input";

// Avatar
export { Avatar } from "./Avatar";

// Progress
export { Progress, ProgressDots } from "./Progress";

// Metrics
export { MetricCard, Statistic } from "./MetricCard";

// Badge & Chip
export { Badge, Chip } from "./Badge";

// Tooltip
export { Tooltip } from "./Tooltip";

// Diagnostic States
export { Spinner, LoadingSkeleton, EmptyState, ErrorState } from "./Status";

// Story Layouts
export {
  StoryFrame,
  StoryProgress,
  StoryHeader,
  StoryNavigation,
  StoryBackground,
  StoryFooter,
} from "./Story";
export type { StoryFrameProps, StoryProgressProps, StoryHeaderProps, StoryNavigationProps } from "./Story";
