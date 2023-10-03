import { GithubUser } from "./gitHubUser.js"

/*
classe com a lógica dos dados
como os dados serão estruturados

root é a div #app
*/
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()

    GithubUser.search('maykbrito').then(user => console.log(user))
  }

  load() { 
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  //salva no localstorage transformando o array de objetos em uma string JSON
  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try { 
      const userExists = this.entries.find(entry => entry.login === username)
      console.log(userExists)

      if(userExists) {
        throw new Error('Usuário já cadastrado!')
      }
      
      const user = await GithubUser.search(username)
    
      if(user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries] //busca o user solicitado e traz junto todos os user q já tinha buscado
      this.update() //reescreve com todos as novas entradas
      this.save()

    } catch(error) {
      alert(error.message)
    }
  }

  delete(user){
    const filteredEntries = this.entries
      .filter(entry => entry.login !== user.login)
 
      this.entries = filteredEntries
      this.update()
      this.save()
  }
}

/*
classe que vai criar a visualização e eventos do HTML
*/
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')

      this.add(value)
    }
  }

  update() {
    this.removeAllTr()

    //recriando a tabela
    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')
        if(isOk){
          this.delete(user)
        }
      }


      this.tbody.append(row)
    })

    this.checkEmpty()
  }

  checkEmpty() {
    const emptyState = this.root.querySelector(".none")
    this.entries.length <= 0 ? emptyState.classList.remove("hide") : emptyState.classList.add("hide")
}

  createRow() {
    const tr =  document.createElement('tr')

    tr.innerHTML = `
    <td class="user">
      <img src="https://github.com/De-Fischer.png" alt="Imagem de usuário do Github">
      <a href="https://github.com/De-Fischer" target="_blank">
        <p>Mayk Brito</p>
        <span>maykbrito</span>
      </a>
    </td>
    <td class="repositories">
      20
    </td>
    <td class="followers">
      45
    </td>
    <td>
      <button class="remove">Remover</button>
    </td>
    `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach((tr) => {
      tr.remove()
    })
  }
}
