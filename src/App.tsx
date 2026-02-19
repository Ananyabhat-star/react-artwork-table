import { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedRows, setSelectedRows] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [inputValue, setInputValue] = useState<number>(0);

  useEffect(() => {
    fetchData(page + 1);
  }, [page]);

  const fetchData = async (pageNumber: number) => {
    try {
      const res = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${pageNumber}`
      );

      const pageData: Artwork[] = res.data.data;

      setArtworks(pageData);
      setTotalRecords(res.data.pagination.total);

      const rowsToSelect = pageData.filter((item) =>
        selectedIds.includes(item.id)
      );

      setSelectedRows(rowsToSelect);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectionChange = (e: any) => {
    const currentPageSelection: Artwork[] = e.value;

    const currentPageIds = artworks.map((item) => item.id);

    const otherPageIds = selectedIds.filter(
      (id) => !currentPageIds.includes(id)
    );

    const newSelectedIds = [
      ...otherPageIds,
      ...currentPageSelection.map((item) => item.id),
    ];

    setSelectedIds(newSelectedIds);
    setSelectedRows(currentPageSelection);
  };

  const handleSelectRows = async () => {
    if (!inputValue || inputValue <= 0) {
      alert("Please enter a valid number");
      return;
    }

    if (inputValue > totalRecords) {
      alert("Number exceeds total available records");
      return;
    }

    let collectedIds: number[] = [];
    let pageNumber = 1;

    while (collectedIds.length < inputValue) {
      const response = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${pageNumber}`
      );

      const pageData: Artwork[] = response.data.data;

      if (!pageData.length) break;

      for (let item of pageData) {
        if (collectedIds.length < inputValue) {
          collectedIds.push(item.id);
        }
      }

      pageNumber++;
    }

    setSelectedIds(collectedIds);

    const currentPageSelected = artworks.filter((item) =>
      collectedIds.includes(item.id)
    );

    setSelectedRows(currentPageSelected);
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1200px",
        margin: "auto",
      }}
    >
      <h1>Artwork Table</h1>

      <p>Total Selected IDs: {selectedIds.length}</p>

      <div style={{ marginBottom: "15px" }}>
        <input
          type="number"
          placeholder="Enter number of rows"
          value={inputValue === 0 ? "" : inputValue}
          onChange={(e) => {
            const val = e.target.value;
            setInputValue(val === "" ? 0 : Number(val));
          }}
          style={{
            marginRight: "10px",
            padding: "6px",
            width: "200px",
          }}
        />

        <button onClick={handleSelectRows}>
          Select Rows
        </button>
      </div>

      <DataTable
        value={artworks}
        paginator
        rows={12}
        totalRecords={totalRecords}
        lazy
        first={page * 12}
        onPage={(e) => setPage(e.page)}
        selection={selectedRows}
        onSelectionChange={handleSelectionChange}
        dataKey="id"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
    </div>
  );
}

export default App;
