export const transitions = {
    spring: {
        type: "spring",
        stiffness: 300,
        damping: 30,
    },
    smooth: {
        type: "tween",
        ease: "easeInOut",
        duration: 0.3,
    },
    bouncy: {
        type: "spring",
        stiffness: 400,
        damping: 15,
    },
}

export const variants = {
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },
    slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    },
    scaleIn: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
    },
    staggerContainer: {
        animate: {
            transition: {
                staggerChildren: 0.1,
            },
        },
    },
}
