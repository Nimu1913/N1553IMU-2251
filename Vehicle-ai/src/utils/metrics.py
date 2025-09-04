import time
from typing import Dict
from prometheus_client import Counter, Histogram, Gauge

class MetricsCollector:
    def __init__(self):
        self.timers = {}
        self.counters = {}
        self.processing_time = Histogram('processing_time_seconds', 'Time spent processing')
        self.requests_total = Counter('requests_total', 'Total requests')
        self.errors_total = Counter('errors_total', 'Total errors')
    
    def start_timer(self, name: str):
        self.timers[name] = time.time()
    
    def stop_timer(self, name: str) -> float:
        if name in self.timers:
            elapsed = time.time() - self.timers[name]
            del self.timers[name]
            return elapsed
        return 0.0
    
    def get_stage_times(self) -> Dict[str, float]:
        return dict(self.counters)
    
    def get_all_metrics(self) -> Dict[str, any]:
        return {
            "timers": dict(self.timers),
            "counters": dict(self.counters)
        }
