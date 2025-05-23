const modal = document.querySelector('#modal');
const addButton = document.getElementById('add-book');
const closeModal = document.getElementById('close');
const UNCOMPLETED_BOOK_ID = "unread";
const COMPLETED_BOOK_ID = "read";
const BOOK_ITEMID = "itemId";

const searchContainer = document.querySelector('.col-1');
const uncompletedBookList = document.getElementById(UNCOMPLETED_BOOK_ID);
const completedBookList = document.getElementById(COMPLETED_BOOK_ID);

const addBook = () => {
  const inputTitle = document.getElementById('title').value;
  const inputAuthor = document.getElementById('author').value;
  const inputYear = document.getElementById('year').value;
  const isCompleted = document.getElementById('isComplete').checked;

  const book = makeBook(inputTitle, inputAuthor, inputYear, isCompleted);
  const bookObject = composeBookObject(inputTitle, inputAuthor, inputYear, isCompleted);

  book[BOOK_ITEMID] = bookObject.id;
  books.push(bookObject);

  if (isCompleted) {
    completedBookList.append(book);
  } else {
    uncompletedBookList.append(book);
  }
  
  updateDataToStorage();
  resetForm();
}

const makeBook = (title, author, year, isCompleted) => {
  const image = document.createElement('img');
  image.setAttribute('src', isCompleted ? 'assets/read.jpg' : 'assets/unread.jpg');

  const imageBook = document.createElement('div');
  imageBook.classList.add('image-book');
  imageBook.append(image);

  const bookTitle = document.createElement('h3');
  bookTitle.innerText = title;
  bookTitle.setAttribute('data-testid', 'bookItemTitle');

  const authorName = document.createElement('p');
  authorName.innerText = `Penulis: ${author}`;
  authorName.setAttribute('data-testid', 'bookItemAuthor');

  const bookYear = document.createElement('small');
  bookYear.innerText = `Tahun: ${year}`;
  bookYear.setAttribute('data-testid', 'bookItemYear');

  const editBtn = createEditButton();

  const detail = document.createElement('div');
  detail.classList.add('detail-book');
  detail.append(bookTitle, authorName, bookYear, editBtn);

  const container = document.createElement('div');
  container.classList.add('my-container');
  container.setAttribute('data-testid', 'bookItem');
  
  const tempId = new Date().getTime();
  container.setAttribute('data-bookid', (isCompleted ? 'complete-' : 'incomplete-') + tempId);
  
  container.append(imageBook, detail);

  if (isCompleted) {
    container.append(createUnreadButton(), createTrashButton());
  } else {
    container.append(createReadButton(), createTrashButton());
  }

  return container;
}

const createButton = (buttonTypeClass, eventListener) => {
  const button = document.createElement('button');
  button.classList.add(buttonTypeClass);
  button.addEventListener("click", function (event) {
    eventListener(event);
  });
  return button;
}

const createReadButton = () => {
  const button = createButton("read-button", event => addBookToCompleted(event.target.parentElement));
  button.setAttribute('data-testid', 'bookItemIsCompleteButton');
  return button;
}

const addBookToCompleted = (bookElement) => {
  const bookTitle = bookElement.querySelector(".detail-book > h3").innerText;
  const bookAuthor = bookElement.querySelector(".detail-book > p").innerText.replace('Penulis: ', '');
  const bookYear = bookElement.querySelector(".detail-book > small").innerText.replace('Tahun: ', '');

  const newBook = makeBook(bookTitle, bookAuthor, bookYear, true);
  const book = findBook(bookElement[BOOK_ITEMID]);
  book.isComplete = true;
  newBook[BOOK_ITEMID] = book.id;
  
  // PERBAIKAN: Memastikan data-bookid menyimpan ID buku yang sama
  newBook.setAttribute('data-bookid', 'complete-' + book.id);

  completedBookList.append(newBook);
  bookElement.remove();
  updateDataToStorage();
}

const removeBookFromCompleted = (bookElement) => {
  const bookPosition = findBookIndex(bookElement[BOOK_ITEMID]);
  books.splice(bookPosition, 1);
  bookElement.remove();
  updateDataToStorage();
}

const createTrashButton = () => {
  const button = createButton("trash-book", event => removeBookFromCompleted(event.target.parentElement));
  button.setAttribute('data-testid', 'bookItemDeleteButton');
  return button;
}

const undoBookFromCompleted = (bookElement) => {
  const bookTitle = bookElement.querySelector(".detail-book > h3").innerText;
  const bookAuthor = bookElement.querySelector(".detail-book > p").innerText.replace('Penulis: ', '');
  const bookYear = bookElement.querySelector(".detail-book > small").innerText.replace('Tahun: ', '');

  const newBook = makeBook(bookTitle, bookAuthor, bookYear, false);
  const book = findBook(bookElement[BOOK_ITEMID]);
  book.isComplete = false;
  newBook[BOOK_ITEMID] = book.id;
  
  // PERBAIKAN: Memastikan data-bookid menyimpan ID buku yang sama 
  newBook.setAttribute('data-bookid', 'incomplete-' + book.id);

  uncompletedBookList.append(newBook);
  bookElement.remove();
  updateDataToStorage();
}

const createUnreadButton = () => {
  const button = createButton("unread-button", event => undoBookFromCompleted(event.target.parentElement));
  button.setAttribute('data-testid', 'bookItemIsCompleteButton');
  return button;
}

const updateBookCount = () => {
  const bookCountElement = document.getElementById('jumlahBuku');
  bookCountElement.innerText = books.length;
}

const resetForm = () => {
  document.getElementById('title').value = '';
  document.getElementById('author').value = '';
  document.getElementById('year').value = '';
  document.getElementById('isComplete').checked = false;
}

const createSearchForm = () => {
  const searchDiv = document.createElement('div');
  searchDiv.classList.add('my-container', 'mt-2');

  const searchForm = document.createElement('form');
  searchForm.id = 'searchForm';
  searchForm.setAttribute('data-testid', 'searchBookForm');

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'searchBook';
  searchInput.placeholder = 'Cari Buku...';
  searchInput.setAttribute('data-testid', 'searchBookFormTitleInput');

  const searchButton = document.createElement('button');
  searchButton.classList.add('submit');
  searchButton.type = 'submit';
  searchButton.innerHTML = '<i class="fi-rr-search"></i>';
  searchButton.setAttribute('data-testid', 'searchBookFormSubmitButton');

  searchForm.append(searchInput, searchButton);
  searchDiv.append(searchForm);

  const userInfoElement = document.querySelector('.user-information');
  searchContainer.insertBefore(searchDiv, userInfoElement.nextSibling);

  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    searchBooks();
  });
}

const searchBooks = () => {
  const searchInput = document.getElementById('searchBook').value.toLowerCase();

  uncompletedBookList.innerHTML = '<h4 class="">Belum Dibaca</h4>';
  completedBookList.innerHTML = '<h4>Sudah Dibaca</h4>';

  if (searchInput === '') {
    refreshDataFromBooks();
    return;
  }

  const filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchInput));

  filteredBooks.forEach(book => {
    const newBook = makeBook(book.title, book.author, book.year, book.isComplete);
    newBook[BOOK_ITEMID] = book.id;
    
    // PERBAIKAN: Memastikan data-bookid menyimpan ID buku yang sebenarnya
    newBook.setAttribute('data-bookid', (book.isComplete ? 'complete-' : 'incomplete-') + book.id);

    if (book.isComplete) {
      completedBookList.append(newBook);
    } else {
      uncompletedBookList.append(newBook);
    }
  });
}

const createEditButton = () => {
  const editButton = document.createElement('button');
  editButton.classList.add('edit-button');
  editButton.innerHTML = '<i class="fi-rr-edit"></i> Edit';
  editButton.setAttribute('data-testid', 'bookItemEditButton');
  Object.assign(editButton.style, {
    backgroundColor: 'var(--primary)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '5px 10px',
    marginTop: '10px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '500',
    transition: 'var(--transition)'
  });
  editButton.addEventListener('click', function() {
    const bookElement = this.closest('.my-container');
    openEditModal(bookElement);
  });
  return editButton;
}

const createEditModal = () => {
  const editModal = document.createElement('div');
  editModal.id = 'editModal';
  editModal.style.cssText = 'position: fixed; top: 0; left: 0; height: 100%; width: 100%; z-index: 20; background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: none; transition: all 0.3s ease; justify-content: center; align-items: center;';

  const modalContainer = document.createElement('section');
  modalContainer.classList.add('my-container');
  modalContainer.style.cssText = 'width: 450px; max-width: 90%; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); padding: 30px;';

  const modalTitle = document.createElement('h2');
  modalTitle.textContent = 'Edit Book';
  modalTitle.style.cssText = 'color: var(--primary); text-align: center; margin-bottom: 25px; font-weight: 600; position: relative; display: inline-block; left: 50%; transform: translateX(-50%);';

  const form = document.createElement('form');
  form.id = 'editForm';
  form.setAttribute('data-testid', 'editBookForm');

  const hiddenId = document.createElement('input');
  hiddenId.type = 'hidden';
  hiddenId.id = 'editBookId';

  const titleGroup = document.createElement('div');
  titleGroup.classList.add('input-group');
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.id = 'editTitle';
  titleInput.placeholder = 'Judul Buku';
  titleInput.classList.add('input-form');
  titleInput.maxLength = 120;
  titleInput.pattern = "^[a-zA-Z0-9_ ]*$";
  titleInput.required = true;
  titleInput.setAttribute('data-testid', 'editBookFormTitleInput');
  titleGroup.appendChild(titleInput);

  const authorGroup = document.createElement('div');
  authorGroup.classList.add('input-group');
  const authorInput = document.createElement('input');
  authorInput.type = 'text';
  authorInput.id = 'editAuthor';
  authorInput.placeholder = 'Author';
  authorInput.classList.add('input-form');
  authorInput.maxLength = 60;
  authorInput.pattern = "^[a-zA-Z0-9_ ]*$";
  authorInput.required = true;
  authorInput.setAttribute('data-testid', 'editBookFormAuthorInput');
  authorGroup.appendChild(authorInput);

  const yearGroup = document.createElement('div');
  yearGroup.classList.add('input-group');
  const yearInput = document.createElement('input');
  yearInput.type = 'date';
  yearInput.id = 'editYear';
  yearInput.classList.add('input-form');
  yearInput.min = '1900';
  yearInput.max = '2026';
  yearInput.setAttribute('data-testid', 'editBookFormYearInput');
  yearGroup.appendChild(yearInput);

  const buttonGroup = document.createElement('div');
  buttonGroup.classList.add('button-group');
  
  const closeButton = document.createElement('button');
  closeButton.type = 'reset';
  closeButton.classList.add('close');
  closeButton.id = 'closeEdit';
  closeButton.textContent = 'Close';
  closeButton.addEventListener('click', closeEditModal);

  const saveButton = document.createElement('button');
  saveButton.type = 'submit';
  saveButton.id = 'saveEdit';
  saveButton.textContent = 'Update';
  saveButton.setAttribute('data-testid', 'editBookFormSubmitButton');

  buttonGroup.append(closeButton, saveButton);
  form.append(hiddenId, titleGroup, authorGroup, yearGroup, buttonGroup);
  modalContainer.append(modalTitle, form);
  editModal.appendChild(modalContainer);
  document.body.appendChild(editModal);

  form.addEventListener('submit', handleEditFormSubmit);
}

const openEditModal = (bookElement) => {
  const editModal = document.getElementById('editModal');
  const bookId = bookElement[BOOK_ITEMID];
  const book = findBook(bookId);

  if (book) {
    document.getElementById('editBookId').value = book.id;
    document.getElementById('editTitle').value = book.title;
    document.getElementById('editAuthor').value = book.author;
    document.getElementById('editYear').value = book.year;
    editModal.style.display = 'flex';
  }
}

const closeEditModal = () => {
  document.getElementById('editModal').style.display = 'none';
}

const handleEditFormSubmit = (e) => {
  e.preventDefault();
  const bookId = parseInt(document.getElementById('editBookId').value);
  const newTitle = document.getElementById('editTitle').value;
  const newAuthor = document.getElementById('editAuthor').value;
  const newYear = document.getElementById('editYear').value;
  const bookToEdit = findBook(bookId);

  if (bookToEdit) {
    bookToEdit.title = newTitle;
    bookToEdit.author = newAuthor;
    bookToEdit.year = parseInt(newYear);
    updateDataToStorage();
    closeEditModal();
    refreshDisplay();
  }
}

const refreshDisplay = () => {
  uncompletedBookList.innerHTML = '<h4 class="">Belum Dibaca</h4>';
  completedBookList.innerHTML = '<h4>Sudah Dibaca</h4>';
  refreshDataFromBooks();
}

addButton.addEventListener("click", () => modal.classList.toggle("modal-open"));
closeModal.addEventListener("click", () => {
  modal.style.transition = '1s';
  modal.classList.toggle("modal-open");
});

document.addEventListener("DOMContentLoaded", function () {
  createSearchForm();
  createEditModal();
  document.getElementById("form").addEventListener("submit", function (event) {
    event.preventDefault();
    modal.classList.remove("modal-open");
    addBook();
  });
  if (checkStorage()) loadDatafromStorage();
});

document.addEventListener("ondatasaved", () => {
  console.log("Data berhasil disimpan.");
  updateBookCount();
});

document.addEventListener("ondataloaded", () => {
  refreshDataFromBooks();
  updateBookCount();
});