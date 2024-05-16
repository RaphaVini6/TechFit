from flask import Flask, request, render_template_string

app = Flask(__name__)

@app.route('/search')
def search():
    query = request.args.get('query', '')  # Pega a query da URL
    # Processar a busca aqui
    return render_template_string('Resultados da busca para: {{query}}', query=query)

if __name__ == '__main__':
    app.run(debug=True)
