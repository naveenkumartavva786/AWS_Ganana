import os
import logging
from datetime import datetime


def get_cluster_logger(cluster_name):
    # Get the current date to include in the log filename
    log_dir = os.path.join('logs', 'clusters')
    os.makedirs(log_dir, exist_ok=True)  # Create the directory if it doesn't exist
    log_filename = f"{cluster_name}_{datetime.now().strftime('%Y-%m-%d')}.log"
    log_file = os.path.join(log_dir, log_filename)

    # Create a logger instance for the specific cluster
    logger = logging.getLogger(f'cluster_creation_{cluster_name}')

    # Remove existing handlers if any
    if logger.hasHandlers():
        logger.handlers.clear()

    # Create a file handler for the specific log file
    file_handler = logging.FileHandler(log_file)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    logger.setLevel(logging.INFO)

    return logger
