import './index.css'

import * as dom from './dom'

const projectsPath = './projects/data.json'

let activeProject
let projects

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const animationStep = 0.3
const animationStart = 0.5

const getSize = () => {
  const width = document.documentElement.clientWidth

  if (width < 480) {
    return 1
  } else if (width >= 480 && width < 768) {
    return 2
  } else if (width >= 768 && width < 1024) {
    return 3
  } else if (width >= 1024 && width < 1280) {
    return 4
  } else if (width >= 1280 && width <= 1440) {
    return 5
  } else if (width > 1440 && width < 1600) {
    return 6
  } else {
    return 7
  }
}

const resizeItems = () => {
  Array.from(dom.listContainer.querySelectorAll('.list__item--dummy')).forEach(el => {
    el.parentElement.removeChild(el)
  })

  const a = projects.filter(dItem => !dItem.hidden).length
  const b = getSize() * 2

  if (a < b) {
    for (var i = a; i < b; i++) {
      let index = i
      dom.listContainer.insertAdjacentHTML('beforeend', `
        <div class="list__item list__item--dummy">
          <div class="list__item-image" style="animation-delay: ${animationStart + animationStep * index}s">
          </div>
          <div class="list__item-text" style="animation-delay: ${animationStart + animationStep * index}s">
          </div>
        </div>
      `)
    }
  }

  const size = 100 / getSize()
  Array.from(dom.listContainer.querySelectorAll('.list__item')).forEach(el => {
    el.style.width = `${size}%`
    el.style.height = `${50}vh`
  })
}

const renderProjects = data => {
  let index = 0

  data.forEach(dataItem => {
    if (dataItem.hidden) {
      return
    }

    dom.mainContainer.insertAdjacentHTML('beforeend', `
      <div class="main__item" data-id="${dataItem.id}" style="background: hsl(${Math.random() * 360}, 80%, 10%)">
        <div class="main__item-inner">
        <div class="main__item-video">
          <video loop muted style="transform: scale(${0.5 + Math.random() * 0.5})">
            <source src="${dataItem.video}" type="video/mp4">
          </video>
          <div class="main__item-video-overlay">
            <span></span>
          </div>
        </div>
        </div>
      </div>
    `)

    dom.mainUiNav.insertAdjacentHTML('beforeend', `
      <button class="main__ui-nav-button ui-button" data-id="${dataItem.id}">
        <svg viewBox="0 0 15 15">
          <circle cx="8" cy="8" r="3"></circle>
        </svg>
      </button>
    `)

    dom.listContainer.insertAdjacentHTML('beforeend', `
      <a href="#${dataItem.id}" class="list__item" data-id="${dataItem.id}">
        <div class="list__item-image" style="animation-delay: ${animationStart + animationStep * index}s">
          <img src="${dataItem.preview}"/>
        </div>
        <div class="list__item-text" style="animation-delay: ${animationStart + animationStep * index}s">
          <p>${dataItem.title}</p>
        </div>
      </a>
    `)

    index++
  })

  projects = data

  resizeItems()
}

const activateProject = id => {
  if (id === activeProject || id === null) {
    return
  }

  const prevProject = activeProject

  if (id === 'next') {
    const currIndex = projects.map(p => p.id).indexOf(activeProject)
    if (projects[currIndex + 1]) {
      activeProject = projects[currIndex + 1].id
    } else {
      activeProject = projects[0].id
    }
  } else if (id === 'prev') {
    const currIndex = projects.map(p => p.id).indexOf(activeProject)
    if (projects[currIndex - 1]) {
      activeProject = projects[currIndex - 1].id
    } else {
      activeProject = projects[projects.length - 1].id
    }
  } else {
    activeProject = id
  }

  console.log(`Activating project ${activeProject}`)

  const prevProjectItem = dom.mainContainer.querySelector(`.main__item[data-id="${prevProject}"]`)
  const projectItem = dom.mainContainer.querySelector(`.main__item[data-id="${activeProject}"]`)

  if (prevProjectItem) {
    const n = projects.findIndex(p => p.id === activeProject)
    const p = projects.findIndex(p => p.id === prevProject)
    const direction = id === 'next' || id === 'prev'
      ? id
      : (n > p ? 'next' : 'prev')

    prevProjectItem.classList.remove(`main__item--active`)
    prevProjectItem.classList.add(`main__item--out-${direction}`)
    setTimeout(() => {
      prevProjectItem.classList.remove(`main__item--out-${direction}`)
    }, 1000)
  }
  projectItem.classList.add('main__item--active')

  const projectItemVideo = projectItem.querySelector(`video`)
  if (projectItemVideo) {
    const projectItemVideos = Array.from(dom.mainContainer.querySelectorAll('video'))
    projectItemVideos.forEach(item => {
      item.pause()
      item.currentTime = 0
    })
    projectItemVideo.play()
  }

  const button = dom.mainUiNav.querySelector(`.main__ui-nav-button[data-id="${activeProject}"]`)
  if (button) {
    const buttons = Array.from(dom.mainUiNav.querySelectorAll('.main__ui-nav-button'))
    buttons.forEach(item => item.classList.remove('main__ui-nav-button--active'))
    button.classList.add('main__ui-nav-button--active')
  }
}

const fetchProject = template => {
  fetch(template)
    .then(res => res.text())
    .then(html => {
      dom.projectContent.innerHTML = html
      const h = dom.projectContent.querySelector('.prj-header')


      if (h) {
        h.style.background = `hsl(${Math.random() * 360}, 50%, 40%)`
      }
      dom.project.classList.add('project--visible')
    })
}

const loadProject = id => {
  if (id === null) {
    return
  }

  fetchProject(projects.filter(projectItem => projectItem.id === id)[0].template)

}

const handleProjectActivationClick = e => {
  let target = e.target
  let id

  while (!id && target) {
    id = target.getAttribute('data-id')
    target = target.parentElement
  }

  activateProject(id)
}

const handleProjectLoadClick = e => {
  let target = e.target
  let id

  while (!id && target) {
    id = target.getAttribute('data-id')
    target = target.parentElement
  }

  loadProject(id)
}

const handleBodyKeydown = e => {
  if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') {
    activateProject('prev')
  } else if (e.code === 'ArrowRight' || e.code === 'ArrowDown') {
    activateProject('next')
  }
}

const getProjects = () => {
  return fetch(projectsPath, {
    'Content-Type': 'application/json'
  })
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data)) {
        throw new TypeError('Object is not an array')
      }
      return data.filter(dataItem => !dataItem.hidden)
    })
    .catch(reason => {
      console.warn('Failed to load projects data:', reason)
      console.warn(`Make sure the path "${projectsPath}" is correct and it's a proper JSON array`)
      throw new Error('meh')
    })
}

const handleProjectHideClick = () => {
  dom.project.classList.remove('project--visible')
}

const addEvents = () => {
  dom.mainUiAbout.addEventListener('click', () => dom.about.classList.add('about--visible'))
  dom.aboutUiHide.addEventListener('click', () => dom.about.classList.remove('about--visible'))
  dom.mainUiList.addEventListener('click', () => dom.list.classList.add('list--visible'))
  dom.listUiHide.addEventListener('click', () => dom.list.classList.remove('list--visible'))

  dom.mainUiNav.addEventListener('click', handleProjectActivationClick)
  dom.listContainer.addEventListener('click', handleProjectLoadClick)
  dom.mainContainer.addEventListener('click', handleProjectLoadClick)

  dom.projectHide.addEventListener('click', handleProjectHideClick)

  document.body.addEventListener('keydown', handleBodyKeydown)
  window.addEventListener('resize', resizeItems)
}

const init = () => {
  addEvents()
  getProjects()
    .then(data => {
      renderProjects(data)

      const firstProject = data[0]

      if (firstProject) {
        activateProject(firstProject.id)
      } else {
        throw new Error('No projects')
      }
    })
    .then(delay.bind(null, 2000))
    .then(() => {
      // dom.app.classList.add('loaded')
    })
    .catch(e => {
      console.log(e)
    })
}

document.addEventListener('DOMContentLoaded', () => {
  init()
})
