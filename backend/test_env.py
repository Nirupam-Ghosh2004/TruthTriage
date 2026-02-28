import sys
print("Executable:", sys.executable)
print("Path:", sys.path)
try:
    import langchain
    print("Langchain:", langchain.__file__)
    from langchain.chains import RetrievalQA
    print("Success importing chains!")
except Exception as e:
    print("Error:", e)
