import { motion, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";

export default function StickyJoinNow() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-brand-accent z-[60] origin-left"
        style={{ scaleX }}
      />
      
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: isVisible ? 0 : 100 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-brand-dark/90 backdrop-blur-lg border-t border-white/10 p-4 md:hidden"
      >
        <a href="#contact" className="w-full btn-primary block text-center py-4">
          Join AimFit Now
        </a>
      </motion.div>
    </>
  );
}
