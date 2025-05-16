const modal = document.querySelector('#modal');
const addButton = document.getElementById('add-book');
const closeModal = document.getElementById('close');
const UNCOMPLETED_BOOK_ID = "unread";
const COMPLETED_BOOK_ID = "read";
const BOOK_ITEMID = "itemId";

const searchContainer = document.querySelector('.col-1');
const uncompletedBookList = document.getElementById(UNCOMPLETED_BOOK_ID);
const completedBookList = document.getElementById(COMPLETED_BOOK_ID);

// Fungsi untuk menambah buku
const addBook = () => {
  const inputTitle = document.getElementById('title').value;
  const inputAuthor = document.getElementById('author').value;
  const inputYear = document.getElementById('year').value;
  
  const book = makeBook(inputTitle, inputAuthor, inputYear, false);
  const bookObject = composeBookObject(inputTitle, inputAuthor, inputYear, false);
  
  book[BOOK_ITEMID] = bookObject.id;
  books.push(bookObject);
  
  uncompletedBookList.append(book);
  updateDataToStorage();
  resetForm();
}

const makeBook = (title, author, year, isCompleted) => {
  const image = document.createElement('img');
  if(isCompleted) {
    image.setAttribute('src', 'assets/read.jpg');
  } else {
    image.setAttribute('src', 'assets/unread.jpg');
  }

  const imageBook = document.createElement('div');
  imageBook.classList.add('image-book');
  imageBook.append(image);
  
  const bookTitle = document.createElement('h3');
  bookTitle.innerText = title;
  
  const authorName = document.createElement('p');
  authorName.innerText = author;
  
  const bookYear = document.createElement('small');
  bookYear.innerText = `${year}`;

  // Button untuk edit
  const editBtn = createEditButton();
  
  const detail = document.createElement('div');
  detail.classList.add('detail-book');
  detail.append(bookTitle, authorName, bookYear, editBtn);
  
  const container = document.createElement('div');
  container.classList.add('my-container');
  container.append(imageBook, detail);
 
  if(isCompleted){
    container.append(
      createUnreadButton(),
      createTrashButton()
    );
  } else {
    container.append(
      createReadButton(),
      createTrashButton()
    );
  }
  return container;
}

// Button untuk menambah
const createButton = (buttonTypeClass, eventListener) => {
  const button = document.createElement('button');
  button.classList.add(buttonTypeClass);
  
  button.addEventListener("click", function (event) {
    eventListener(event);
  });
  return button;
}

// Button untuk membaca
const createReadButton = () => {
  return createButton("read-button", function (event) {
    addBookToCompleted(event.target.parentElement);
  });
}

// Fungsi untuk memindah buku yang sudah dibaca
const addBookToCompleted = (bookElement) => {
  const bookTitle = bookElement.querySelector(".detail-book > h3").innerText;
  const bookAuthor = bookElement.querySelector(".detail-book > p").innerText;
  const bookYear = bookElement.querySelector(".detail-book > small").innerText;
 
  const newBook = makeBook(bookTitle, bookAuthor, bookYear, true);
  const book = findBook(bookElement[BOOK_ITEMID]);
  book.isCompleted = true;
  newBook[BOOK_ITEMID] = book.id;
  
  completedBookList.append(newBook);
  bookElement.remove();
    
  updateDataToStorage();
} 

// Menghilangkan buku
const removeBookFromCompleted = (bookElement) => {
  const bookPosition = findBookIndex(bookElement[BOOK_ITEMID]);
  books.splice(bookPosition, 1);
  bookElement.remove();
  updateDataToStorage();
}

// Button untuk remove
const createTrashButton = () => {
  return createButton("trash-book", function(event){
    removeBookFromCompleted(event.target.parentElement);
  });
}

// Fungsi untuk memindahkan buku ke belum dibaca
const undoBookFromCompleted = (bookElement) => {
  const bookTitle = bookElement.querySelector(".detail-book > h3").innerText;
  const bookAuthor = bookElement.querySelector(".detail-book > p").innerText;
  const bookYear = bookElement.querySelector(".detail-book > small").innerText;
 
  const newBook = makeBook(bookTitle, bookAuthor, bookYear, false);
  const book = findBook(bookElement[BOOK_ITEMID]);
  book.isCompleted = false;
  newBook[BOOK_ITEMID] = book.id;
  
  uncompletedBookList.append(newBook);
  bookElement.remove();
  updateDataToStorage();
}

const createUnreadButton = () => {
  return createButton("unread-button", function(event){
    undoBookFromCompleted(event.target.parentElement);
  });
}

// Fungsi menghitung buku
const updateBookCount = () => {
  const bookCountElement = document.getElementById('jumlahBuku');
  bookCountElement.innerText = books.length;
}

const resetForm = () => {
  document.getElementById('title').value = '';
  document.getElementById('author').value = '';
  document.getElementById('year').value = '';
}

// Fungsi untuk mencari buku
const createSearchForm = () => {
  const searchDiv = document.createElement('div');
  searchDiv.classList.add('my-container', 'mt-2');
  
  const searchForm = document.createElement('form');
  searchForm.id = 'searchForm';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'searchBook';
  searchInput.placeholder = 'Cari Buku...';
  
  const searchButton = document.createElement('button');
  searchButton.classList.add('submit');
  searchButton.type = 'submit';
  searchButton.innerHTML = '<i class="fi-rr-search"></i>';
  
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
  
  // Fitur untuk melakukan filter
  const filteredBooks = books.filter(book => 
    book.bookTitle.toLowerCase().includes(searchInput)
  );
  
  filteredBooks.forEach(book => {
    const newBook = makeBook(book.bookTitle, book.bookAuthor, book.bookYear, book.isCompleted);
    newBook[BOOK_ITEMID] = book.id;
    
    if (book.isCompleted) {
      completedBookList.append(newBook);
    } else {
      uncompletedBookList.append(newBook);
    }
  });
}

// Button untuk edit
const createEditButton = () => {
  const editButton = document.createElement('button');
  editButton.classList.add('edit-button');
  editButton.innerHTML = '<i class="fi-rr-edit"></i> Edit';
  editButton.style.backgroundColor = 'var(--primary)';
  editButton.style.color = 'white';
  editButton.style.border = 'none';
  editButton.style.borderRadius = 'var(--radius-sm)';
  editButton.style.padding = '5px 10px';
  editButton.style.marginTop = '10px';
  editButton.style.cursor = 'pointer';
  editButton.style.fontSize = '0.8rem';
  editButton.style.fontWeight = '500';
  editButton.style.transition = 'var(--transition)';
  
  editButton.addEventListener('click', function() {
    const bookElement = this.closest('.my-container');
    openEditModal(bookElement);
  });
  
  return editButton;
}

const createEditModal = () => {
  const editModalDiv = document.createElement('div');
  editModalDiv.id = 'editModal';
  editModalDiv.style.position = 'fixed';
  editModalDiv.style.top = '0';
  editModalDiv.style.left = '0';
  editModalDiv.style.height = '100%';
  editModalDiv.style.width = '100%';
  editModalDiv.style.zIndex = '30';
  editModalDiv.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
  editModalDiv.style.backdropFilter = 'blur(8px)';
  editModalDiv.style.display = 'none';
  editModalDiv.style.justifyContent = 'center';
  editModalDiv.style.alignItems = 'center';
  
  const editContainer = document.createElement('section');
  editContainer.classList.add('my-container');
  editContainer.style.width = '450px';
  editContainer.style.maxWidth = '90%';
  
  const editTitle = document.createElement('h2');
  editTitle.textContent = 'Edit Book';
  editTitle.style.color = 'var(--primary)';
  editTitle.style.textAlign = 'center';
  editTitle.style.marginBottom = '25px';
  
  const editForm = document.createElement('form');
  editForm.id = 'editForm';
  
  const bookIdInput = document.createElement('input');
  bookIdInput.type = 'hidden';
  bookIdInput.id = 'editBookId';
  
  const titleGroup = document.createElement('div');
  titleGroup.classList.add('input-group');
  
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.id = 'editTitle';
  titleInput.placeholder = 'Judul Buku';
  titleInput.classList.add('input-form');
  titleInput.required = true;
  
  titleGroup.appendChild(titleInput);
  
  const authorGroup = document.createElement('div');
  authorGroup.classList.add('input-group');
  
  const authorInput = document.createElement('input');
  authorInput.type = 'text';
  authorInput.id = 'editAuthor';
  authorInput.placeholder = 'Author';
  authorInput.classList.add('input-form');
  authorInput.required = true;
  
  authorGroup.appendChild(authorInput);
  
  const yearGroup = document.createElement('div');
  yearGroup.classList.add('input-group');
  
  const yearInput = document.createElement('input');
  yearInput.type = 'date';
  yearInput.id = 'editYear';
  yearInput.classList.add('input-form');
  
  yearGroup.appendChild(yearInput);

  const buttonGroup = document.createElement('div');
  buttonGroup.classList.add('button-group');
  
  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.id = 'closeEdit';
  cancelButton.classList.add('close');
  cancelButton.textContent = 'Cancel';
  
  const saveButton = document.createElement('button');
  saveButton.type = 'submit';
  saveButton.id = 'saveEdit';
  saveButton.textContent = 'Update';
  
  buttonGroup.append(cancelButton, saveButton);
  
  editForm.append(bookIdInput, titleGroup, authorGroup, yearGroup, buttonGroup);
  editContainer.append(editTitle, editForm);
  editModalDiv.appendChild(editContainer);
  
  document.body.appendChild(editModalDiv);
  
  cancelButton.addEventListener('click', closeEditModal);
  editForm.addEventListener('submit', handleEditFormSubmit);
}

const openEditModal = (bookElement) => {
  const editModal = document.getElementById('editModal');
  const bookId = bookElement[BOOK_ITEMID];
  const book = findBook(bookId);
  
  if (book) {
    document.getElementById('editBookId').value = book.id;
    document.getElementById('editTitle').value = book.bookTitle;
    document.getElementById('editAuthor').value = book.bookAuthor;
    document.getElementById('editYear').value = book.bookYear;
    
    editModal.style.display = 'flex';
  }
}

const closeEditModal = () => {
  const editModal = document.getElementById('editModal');
  editModal.style.display = 'none';
}

const handleEditFormSubmit = (e) => {
  e.preventDefault();
  
  const bookId = parseInt(document.getElementById('editBookId').value);
  const newTitle = document.getElementById('editTitle').value;
  const newAuthor = document.getElementById('editAuthor').value;
  const newYear = document.getElementById('editYear').value;
  
  const bookToEdit = findBook(bookId);
  if (bookToEdit) {
    bookToEdit.bookTitle = newTitle;
    bookToEdit.bookAuthor = newAuthor;
    bookToEdit.bookYear = newYear;
    
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

addButton.addEventListener("click", () => {
  modal.classList.toggle("modal-open");
});

closeModal.addEventListener("click", () => {
  modal.style.transition = '1s';
  modal.classList.toggle("modal-open");
});

document.addEventListener("DOMContentLoaded", function () {
  createSearchForm();
  createEditModal();
  
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    modal.classList.remove("modal-open");
    addBook();
  });

  if(checkStorage()){
    loadDatafromStorage();
  }
});

document.addEventListener("ondatasaved", () => {
  console.log("Data berhasil disimpan.");
  updateBookCount();
});

document.addEventListener("ondataloaded", () => {
  refreshDataFromBooks();
  updateBookCount();
});