import logging
import sys
from pathlib import Path

def get_logger(name: str = "DeepSpur") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        # Console Formatter
        c_handler = logging.StreamHandler(sys.stdout)
        c_format = logging.Formatter('%(asctime)s - [%(levelname)s] - %(name)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
        c_handler.setFormatter(c_format)
        logger.addHandler(c_handler)
        
        # File Logger
        log_dir = Path("results/logs")
        log_dir.mkdir(parents=True, exist_ok=True)
        f_handler = logging.FileHandler(log_dir / "execution.log")
        f_handler.setFormatter(c_format)
        logger.addHandler(f_handler)
        
    return logger