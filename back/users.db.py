from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Definindo a base declarativa
Base = declarative_base()

# Definindo a classe do modelo de usuário
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)

    def __repr__(self):
        return f"<User(username={self.username}, email={self.email})>"

# Criando o banco de dados SQLite
engine = create_engine('sqlite:///users.db')
Base.metadata.create_all(engine)

# Imprimir o caminho do banco de dados
print("Banco de dados criado com sucesso em 'users.db'")