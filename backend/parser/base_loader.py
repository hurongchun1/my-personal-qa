

from abc import abstractmethod


class BaseLoader:
    def __init__(self):
        pass

    @abstractmethod
    def load(self,file_path) -> str:
        '''source可以是file_path或url，由子类决定'''
        pass
    
    @abstractmethod
    def parse(self,file_path,chunk_size,chunk_overlap) -> list[str]:
        '''参数由各子类自行定义'''
        pass