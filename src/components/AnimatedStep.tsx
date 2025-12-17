import { motion, type Variants, type Transition } from "motion/react";
import type { ReactNode } from "react";

interface AnimatedStepProps {
  children: ReactNode;
  stepKey: string;
}

const stepVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const stepTransition: Transition = {
  duration: 0.3,
  ease: "easeOut",
};

export function AnimatedStep({ children, stepKey }: AnimatedStepProps) {
  return (
    <motion.div
      key={stepKey}
      variants={stepVariants}
      transition={stepTransition}
    >
      {children}
    </motion.div>
  );
}
