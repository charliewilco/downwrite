import { motion, AnimatePresence, Transition } from "framer-motion";

function getTransition(duration: number, delay: number): Transition {
  return { type: "tween", duration, delay, loop: Infinity };
}
export default function Loading(): JSX.Element {
  const animation = {
    scale: [0.1, 1, 0],
    opacity: [1, 0.7, 0]
  };

  return (
    <AnimatePresence>
      <motion.div
        role="img"
        className="relative flex flex-col justify-center w-20 h-20 mx-auto my-4 my-auto">
        <motion.div
          animate={animation}
          transition={getTransition(1.5, 1)}
          className="absolute left-0 right-0 w-8 h-8 m-auto border-2 rounded-full border-current"
        />
        <motion.div
          animate={animation}
          transition={getTransition(1.5, 0.75)}
          className="absolute left-0 right-0 w-12 h-12 m-auto border-2 rounded-full border-current"
        />
        <motion.div
          animate={animation}
          transition={getTransition(1.5, 0.5)}
          className="absolute left-0 right-0 w-16 h-16 m-auto border-2 rounded-full border-current"
        />
      </motion.div>
    </AnimatePresence>
  );
}
