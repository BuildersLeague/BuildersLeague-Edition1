'use client'
import NewSurvey from '@/components/NewSurvey'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import React, { useState, useMemo, useEffect } from 'react'
import { Search, Check, X } from 'lucide-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CellPopup from '@/components/CellPopup'
import { createBrowserClient } from '@/utils/supabase'
import { Survey } from '@/types/survey'

const SurveyPage = () => {
  const [isNewSurveyOpen, setIsNewSurveyOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSurveys, setSelectedSurveys] = useState<number[]>([])
  const [surveyStatuses, setSurveyStatuses] = useState<Record<number, boolean>>({})

  const supabase = createBrowserClient()
  const itemsPerPage = 5

  useEffect(() => {
    async function fetchSurveys() {
      const { data, error } = await supabase.from('survey').select('*')
      if (error) {
        console.error('Error fetching surveys:', error)
      } else {
        setSurveys(data as any)
      }
    }
    fetchSurveys()
  }, [])

  useEffect(() => {
    if (surveys.length > 0) {
      setSurveyStatuses(
        surveys.reduce(
          (acc, survey) => ({ ...acc, [survey.id]: survey.status }),
          {},
        )
      )
    }
  }, [surveys])

  const filteredSurveys = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return surveys.filter((survey) =>
      survey.link?.toLowerCase().includes(term) ||
      survey.organization_id?.toString().toLowerCase().includes(term) ||
      survey.created_at?.toLowerCase().includes(term)
    )
  }, [surveys, searchTerm])

  const paginatedSurveys = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredSurveys.slice(startIndex, startIndex + itemsPerPage)
  }, [currentPage, filteredSurveys])

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredSurveys.length / itemsPerPage))
  }, [filteredSurveys])

  const handleStatusChange = async (id: number, status: boolean) => {
    setSurveyStatuses((prev) => ({ ...prev, [id]: status }))
    const { error } = await supabase
      .from('survey')
      .update({ status: status })
      .eq('id', id)
    if (error) {
      console.error('Error updating survey status:', error)
      setSurveyStatuses((prev) => ({ ...prev, [id]: !status }))
    }
  }

  const handleSelectSurvey = (id: number) => {
    setSelectedSurveys((prev) =>
      prev.includes(id)
        ? prev.filter((surveyId) => surveyId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedSurveys(paginatedSurveys.map((survey) => survey.id))
    } else {
      setSelectedSurveys([])
    }
  }

  const exportSelectedSurveys = () => {
    const selectedSurveyData = surveys.filter((survey) =>
      selectedSurveys.includes(survey.id)
    )
    const csvContent = [
      ['ID', 'Name', 'Date', 'Link', 'Target Org', 'Active'],
      ...selectedSurveyData.map((survey) => [
        survey.id,
        survey.created_at,
        survey.link,
        survey.organization_id,
        survey.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'selected_surveys.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const deleteSelectedSurveys = async () => {
    if (selectedSurveys.length === 0) return
    setSelectedSurveys([])
  }

  const renderCell = (content: string, maxLength: number = 20) => {
    if (content === null || content === undefined) {
      return 'N/A'
    }
    if (content.length <= maxLength) {
      return content
    }
    return (
      <CellPopup content={content}>
        <span className="cursor-pointer">{content.slice(0, maxLength)}...</span>
      </CellPopup>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Survey Dashboard</h1>
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="mb-4">
          <Dialog open={isNewSurveyOpen} onOpenChange={setIsNewSurveyOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full bg-green-500 text-white sm:w-auto"
              >
                + Survey
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[825px]">
              <NewSurvey onClose={() => setIsNewSurveyOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex w-full items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search for content..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full rounded-md border py-2 pl-3 pr-10 dark:bg-gray-700"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <Button
              variant="outline"
              className="ml-2 mr-2"
              onClick={exportSelectedSurveys}
            >
              Export selected
            </Button>
            <Button
              variant="outline"
              className="bg-red-500 text-white"
              onClick={deleteSelectedSurveys}
            >
              Delete selected
            </Button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-2">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedSurveys.length === paginatedSurveys.length &&
                    paginatedSurveys.length > 0
                  }
                />
              </th>
              <th className="pb-2">Survey</th>
              <th className="pb-2">Date</th>
              <th className="pb-2">Link to Survey</th>
              <th className="pb-2">Target Org</th>
              <th className="pb-2">Activate/Deactivate</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSurveys.map((survey) => (
              <tr key={survey.id} className="border-b">
                <td className="py-2">
                  <input
                    type="checkbox"
                    checked={selectedSurveys.includes(survey.id)}
                    onChange={() => handleSelectSurvey(survey.id)}
                  />
                </td>
                <td className="py-2">{renderCell(survey.id + '')}</td>
                <td className="py-2">{survey.created_at}</td>
                <td className="py-2">{renderCell(survey.link)}</td>
                <td className="py-2">
                  {renderCell(survey.organization_id + '')}
                </td>
                <td className="py-2">
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="hidden"
                        checked={surveyStatuses[survey.id]}
                        onChange={() => handleStatusChange(survey.id, true)}
                      />
                      <span
                        className={`flex h-6 w-6 cursor-pointer items-center justify-center ${
                          surveyStatuses[survey.id]
                            ? 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      >
                        <Check
                          className={`h-4 w-4 ${
                            surveyStatuses[survey.id]
                              ? 'text-white'
                              : 'text-transparent'
                          }`}
                        />
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="hidden"
                        checked={!surveyStatuses[survey.id]}
                        onChange={() => handleStatusChange(survey.id, false)}
                      />
                      <span
                        className={`flex h-6 w-6 cursor-pointer items-center justify-center ${
                          !surveyStatuses[survey.id]
                            ? 'bg-red-500'
                            : 'bg-gray-200'
                        }`}
                      >
                        <X
                          className={`h-4 w-4 ${
                            !surveyStatuses[survey.id]
                              ? 'text-white'
                              : 'text-transparent'
                          }`}
                        />
                      </span>
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex justify-center">
          <nav className="inline-flex">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={i + 1 === currentPage ? 'default' : 'outline'}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default SurveyPage