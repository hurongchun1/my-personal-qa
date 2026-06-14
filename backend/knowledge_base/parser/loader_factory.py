

from backend.common.exceptions.business_exception import BusinessException
from backend.knowledge_base.parser.base_loader import BaseLoader
from backend.knowledge_base.parser.html_loader import HtmlLoader
from backend.knowledge_base.parser.markdown_loader import MarkdownLoader
from backend.knowledge_base.parser.pdf_loader import PDFLoader
from backend.knowledge_base.parser.txt_loader import TxtLoader


class LoaderFactory:
    '''文档加载器工厂类'''

    # 注册表：文件类型 -> 文档解析加载器对应loader类
    _loaders = {
        "pdf": PDFLoader,
        "markdown": MarkdownLoader,
        "md": MarkdownLoader,
        "html": HtmlLoader,
        "htm": HtmlLoader,
        "txt": TxtLoader
    }

    # 工厂创建方法
    @classmethod
    def create(cls,file_type:str) :
        '''根据文件类型创建出对应的类'''
        # 去除前导点号和首尾空格（数据库存储格式为 ".txt"，注册表为 "txt"）
        clean_type = file_type.lower().lstrip('.').strip()
        if clean_type not in cls._loaders:
            raise BusinessException.file_type_not_supported("文件类型不支持")
        
        # 获取对应的loader，并返回
        class_loader= cls._loaders[clean_type]
        return class_loader() # 创建实例

    @classmethod
    def get_supported_methods(cls,file_type:str):
        '''获取指定文件类型支持的解析方法'''
        # 创建loader
        loader = cls.create(file_type)

        # 调用实例的 get_supported_methods() 返回
        return loader.get_supported_methods()

    @classmethod
    def get_supported_types(cls):
        '''获取所有支持的文件类型'''

        return list(cls._loaders.keys())