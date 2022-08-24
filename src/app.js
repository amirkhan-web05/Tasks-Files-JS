const tasks = document.querySelector('.tasks');
const files = document.querySelector('.files');
const modal = document.querySelector('.modal');
const btnOpen = document.querySelector('.modal__open');

let tasksData = [];
let filesData = [];

const renderModal = () => {
  const modalContent = document.createElement('div');
  modalContent.classList.add('modal__inner');
  return modal.insertAdjacentElement('afterbegin', modalContent);
};

const renderInput = () => {
  const accepts = ['.jpg', '.png', '.jpeg', '.gif'];

  files.insertAdjacentHTML(
    'beforeend',
    `
    <input type='file' class="file__type" accept="${accepts.map((acc) => acc)}">
    <div></div>
  `
  );

  const modalContent = renderModal();

  modalContent.insertAdjacentHTML(
    'beforeend',
    `
    <span class='tasks__close'>&times;</span>
    <div class='tasks__content'>
      <input placeholder='Напиши Tasks...' type='text' class='tasks__input'>
      <button class='tasks__add' data-add='Add-Task'>Добавить</button>
    </div>
  `
  );

  modalContent.insertAdjacentElement('beforeend', files);

  return files;
};

renderInput();

const renderTasks = ({ id, name, completed, filesData }) => {
  const classes = completed ? 'tasks__item tasks__item--toggle' : 'tasks__item';
  tasks.insertAdjacentHTML(
    'beforeend',
    `
      <ul class='tasks__inner'>
        <div class=${classes} id=${id}>
          <li class='tasks__info' data-toggle='toggle'>
            ${name}
            <button class='tasks__remove' data-remove='remove'>Remove</button>
          </li>
          <div>
            ${
              filesData.length
                ? filesData.map(
                    (file) =>
                      `
                        <div>
                          <img width="540px" class='tasks__image' height="300px" src="${file}">
                        </div>
                      `
                  )
                : ''
            }
          </div>
        </div>
        </ul>
      `
  );

  return tasks;
};

const getData = async () => {
  try {
    await fetch('http://localhost:3001/tasks')
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        data.forEach((item) => renderTasks(item));
      });
  } catch (error) {
    console.log('Error:', error);
  }
};

const methods = () => {
  return {
    async onAdd(event) {
      try {
        if (event.target.dataset.add === 'Add-Task') {
          const tasksInput = document.querySelector('.tasks__input');

          if (!tasksInput.value.trim()) return;

          const newTask = {
            name: tasksInput.value,
            completed: false,
            filesData,
          };

          await fetch(`http://localhost:3001/tasks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTask),
          })
            .then((res) => {
              return res.json();
            })
            .then((data) => {
              tasksData.push(data);
              renderTasks(data);
            });

          tasksInput.value = '';
        }
      } catch (error) {
        console.log('Error:', error);
      }
    },
    onFiles(event) {
      const filesEv = Array.from(event.target.files);

      if (Array.isArray(filesEv)) {
        filesEv.forEach((file) => {
          const reader = new FileReader();

          reader.onload = (ev) => {
            const result = ev.target.result;

            files.insertAdjacentHTML(
              'beforeend',
              `
              <img class="preview__image" width="200px" height="200px" src="${result}">
            `
            );

            filesData.push(result);
          };

          reader.readAsDataURL(file);
        });
      }
    },
    async onRemove(event) {
      try {
        if (event.target.dataset.remove === 'remove') {
          const parentNode = event.target.closest('.tasks__item');
          const id = Number(parentNode.id);

          tasksData = tasksData.filter((task) => task.id !== id);

          await fetch(`http://localhost:3001/tasks/${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          parentNode.remove();
        }
      } catch (error) {
        console.log('Error:', error);
      }
    },
    async onToggle(event) {
      try {
        if (event.target.dataset.toggle === 'toggle') {
          const parentNode = event.target.closest('.tasks__item');
          const id = Number(parentNode.id);

          const compls = tasksData.find((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          );

          await fetch(`http://localhost:3001/tasks/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: compls.completed }),
          }).then((data) => data.json());

          parentNode.classList.toggle('tasks__item-toggle');
        }
      } catch (error) {
        console.log('Error:', error);
      }
    },
    open() {
      modal.classList.add('modal__active');
    },
    close() {
      modal.classList.remove('modal__active');
    },
  };
};

const renderMethods = () => {
  const input = document.querySelector('.file__type');
  const button = document.querySelector('[data-add]');
  const close = modal.querySelector('.tasks__close');

  input.addEventListener('change', methods().onFiles);
  button.addEventListener('click', methods().onAdd);
  document.addEventListener('click', methods().onRemove);
  document.addEventListener('click', methods().onToggle);
  btnOpen.addEventListener('click', methods().open);
  close.addEventListener('click', methods().close);

  return methods;
};

renderMethods();
getData();
